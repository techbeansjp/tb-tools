'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface QRCodeMatrixEntry {
  value: number;
  reserved: boolean;
}

type QRCodeMatrix = QRCodeMatrixEntry[][];

interface SizeOption {
  id: string;
  name: string;
  size: number;
}

const QrGenerator: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('256');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const sizeOptions: SizeOption[] = [
    { id: '128', name: '128x128px', size: 128 },
    { id: '256', name: '256x256px', size: 256 },
    { id: '512', name: '512x512px', size: 512 },
    { id: '1024', name: '1024x1024px', size: 1024 }
  ];

  // QRコードのエラー訂正レベル
  const ERROR_CORRECT_LEVEL = {
    L: 1,
    M: 0,
    Q: 3,
    H: 2
  };

  // QRコードバージョン1-4の容量とフォーマット情報
  const QR_CODE_DATA = {
    1: { modules: 21, capacity: 25, formatInfo: [0, 0, 1, 0, 1, 0, 0] },
    2: { modules: 25, capacity: 47, formatInfo: [0, 0, 1, 0, 1, 0, 1] },
    3: { modules: 29, capacity: 77, formatInfo: [0, 0, 1, 1, 0, 1, 0] },
    4: { modules: 33, capacity: 114, formatInfo: [0, 0, 1, 1, 0, 1, 1] }
  };

  // ガロア体GF(256)の演算テーブル
  const GF256_EXP = new Array(512);
  const GF256_LOG = new Array(256);

  // ガロア体の初期化
  const initGF256 = () => {
    let x = 1;
    for (let i = 0; i < 255; i++) {
      GF256_EXP[i] = x;
      GF256_LOG[x] = i;
      x *= 2;
      if (x >= 256) x ^= 0x11d;
    }
    for (let i = 255; i < 512; i++) {
      GF256_EXP[i] = GF256_EXP[i - 255];
    }
  };

  // ガロア体の乗算
  const gfMul = (a: number, b: number): number => {
    if (a === 0 || b === 0) return 0;
    return GF256_EXP[GF256_LOG[a] + GF256_LOG[b]];
  };

  // Reed-Solomon エラー訂正コードの生成
  const generateRSCodes = (data: number[], eccWords: number): number[] => {
    const generator = [1];
    
    // 生成多項式を作成
    for (let i = 0; i < eccWords; i++) {
      const newGen = new Array(generator.length + 1).fill(0);
      for (let j = 0; j < generator.length; j++) {
        newGen[j] = generator[j];
        newGen[j + 1] ^= gfMul(generator[j], GF256_EXP[i]);
      }
      generator.splice(0, generator.length, ...newGen);
    }

    // データを生成多項式で割る
    const remainder = [...data, ...new Array(eccWords).fill(0)];
    for (let i = 0; i < data.length; i++) {
      const coef = remainder[i];
      if (coef !== 0) {
        for (let j = 0; j < generator.length; j++) {
          remainder[i + j] ^= gfMul(generator[j], coef);
        }
      }
    }

    return remainder.slice(data.length);
  };

  // 文字列をバイト配列に変換
  const stringToBytes = (str: string): number[] => {
    const bytes: number[] = [];
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      if (code < 0x80) {
        bytes.push(code);
      } else if (code < 0x800) {
        bytes.push(0xc0 | (code >> 6));
        bytes.push(0x80 | (code & 0x3f));
      } else {
        bytes.push(0xe0 | (code >> 12));
        bytes.push(0x80 | ((code >> 6) & 0x3f));
        bytes.push(0x80 | (code & 0x3f));
      }
    }
    return bytes;
  };

  // QRコードデータの符号化
  const encodeData = (text: string, version: number): number[] => {
    const bytes = stringToBytes(text);
    const capacity = QR_CODE_DATA[version as keyof typeof QR_CODE_DATA].capacity;
    
    if (bytes.length > capacity - 2) {
      throw new Error('データが長すぎます');
    }

    const data: number[] = [];
    
    // モードインジケータ (バイトモード: 0100)
    data.push(0, 1, 0, 0);
    
    // 文字数インジケータ (8ビット)
    for (let i = 7; i >= 0; i--) {
      data.push((bytes.length >> i) & 1);
    }
    
    // データビット
    for (const byte of bytes) {
      for (let i = 7; i >= 0; i--) {
        data.push((byte >> i) & 1);
      }
    }
    
    // パディング
    const totalBits = capacity * 8;
    while (data.length < totalBits && data.length % 8 !== 0) {
      data.push(0);
    }
    
    const padBytes = [0xEC, 0x11];
    let padIndex = 0;
    while (data.length < totalBits) {
      const padByte = padBytes[padIndex % 2];
      for (let i = 7; i >= 0; i--) {
        if (data.length < totalBits) {
          data.push((padByte >> i) & 1);
        }
      }
      padIndex++;
    }
    
    return data;
  };

  // QRコードマトリックスの初期化
  const initMatrix = (size: number): QRCodeMatrix => {
    return Array(size).fill(null).map(() => 
      Array(size).fill(null).map(() => ({ value: 0, reserved: false }))
    );
  };

  // ファインダーパターンの配置
  const placeFinderPattern = (matrix: QRCodeMatrix, x: number, y: number) => {
    const pattern = [
      [1,1,1,1,1,1,1],
      [1,0,0,0,0,0,1],
      [1,0,1,1,1,0,1],
      [1,0,1,1,1,0,1],
      [1,0,1,1,1,0,1],
      [1,0,0,0,0,0,1],
      [1,1,1,1,1,1,1]
    ];
    
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        if (x + i < matrix.length && y + j < matrix.length) {
          matrix[x + i][y + j] = { value: pattern[i][j], reserved: true };
        }
      }
    }
  };

  // セパレータの配置
  const placeSeparator = (matrix: QRCodeMatrix, x: number, y: number, width: number, height: number) => {
    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        if (x + i < matrix.length && y + j < matrix.length && 
            x + i >= 0 && y + j >= 0) {
          matrix[x + i][y + j] = { value: 0, reserved: true };
        }
      }
    }
  };

  // タイミングパターンの配置
  const placeTimingPatterns = (matrix: QRCodeMatrix) => {
    const size = matrix.length;
    for (let i = 8; i < size - 8; i++) {
      matrix[6][i] = { value: i % 2, reserved: true };
      matrix[i][6] = { value: i % 2, reserved: true };
    }
  };

  // ダークモジュールの配置
  const placeDarkModule = (matrix: QRCodeMatrix, version: number) => {
    const size = matrix.length;
    matrix[(4 * version) + 9][8] = { value: 1, reserved: true };
  };

  // フォーマット情報の配置
  const placeFormatInfo = (matrix: QRCodeMatrix, formatBits: number[]) => {
    const size = matrix.length;
    
    // 左上のファインダーパターン周辺
    for (let i = 0; i < 6; i++) {
      matrix[8][i] = { value: formatBits[i], reserved: true };
      matrix[size - 1 - i][8] = { value: formatBits[i], reserved: true };
    }
    
    matrix[8][7] = { value: formatBits[6], reserved: true };
    matrix[8][8] = { value: formatBits[7], reserved: true };
    matrix[7][8] = { value: formatBits[8], reserved: true };
    
    for (let i = 0; i < 6; i++) {
      matrix[5 - i][8] = { value: formatBits[9 + i], reserved: true };
      matrix[8][size - 7 + i] = { value: formatBits[9 + i], reserved: true };
    }
  };

  // データの配置
  const placeData = (matrix: QRCodeMatrix, data: number[]) => {
    const size = matrix.length;
    let dataIndex = 0;
    let up = true;
    
    for (let col = size - 1; col > 0; col -= 2) {
      if (col === 6) col = 5; // タイミングパターンをスキップ
      
      for (let count = 0; count < size; count++) {
        for (let c = 0; c < 2; c++) {
          const x = col - c;
          const y = up ? size - 1 - count : count;
          
          if (!matrix[y][x].reserved && dataIndex < data.length) {
            matrix[y][x].value = data[dataIndex];
            dataIndex++;
          }
        }
      }
      up = !up;
    }
  };

  // QRコードの生成
  const generateQRCode = (text: string): QRCodeMatrix => {
    if (!text) {
      throw new Error('テキストが入力されていません');
    }

    initGF256();
    
    // 適切なバージョンを選択
    let version = 1;
    const bytes = stringToBytes(text);
    for (let v = 1; v <= 4; v++) {
      if (bytes.length <= QR_CODE_DATA[v as keyof typeof QR_CODE_DATA].capacity - 2) {
        version = v;
        break;
      }
    }
    
    if (version > 4) {
      throw new Error('データが長すぎます（バージョン1-4をサポート）');
    }

    const size = QR_CODE_DATA[version as keyof typeof QR_CODE_DATA].modules;
    const matrix = initMatrix(size);
    
    // ファインダーパターンの配置
    placeFinderPattern(matrix, 0, 0);
    placeFinderPattern(matrix, 0, size - 7);
    placeFinderPattern(matrix, size - 7, 0);
    
    // セパレータの配置
    placeSeparator(matrix, 0, 7, 8, 1);
    placeSeparator(matrix, 7, 0, 1, 8);
    placeSeparator(matrix, 0, size - 8, 8, 1);
    placeSeparator(matrix, 7, size - 7, 1, 7);
    placeSeparator(matrix, size - 8, 0, 1, 8);
    placeSeparator(matrix, size - 8, 7, 8, 1);
    
    // タイミングパターンの配置
    placeTimingPatterns(matrix);
    
    // ダークモジュールの配置
    placeDarkModule(matrix, version);
    
    // データの符号化
    const encodedData = encodeData(text, version);
    const dataBytes: number[] = [];
    for (let i = 0; i < encodedData.length; i += 8) {
      let byte = 0;
      for (let j = 0; j < 8 && i + j < encodedData.length; j++) {
        byte = (byte << 1) | encodedData[i + j];
      }
      dataBytes.push(byte);
    }
    
    // エラー訂正コードの生成
    const eccWords = version === 1 ? 7 : version === 2 ? 10 : version === 3 ? 15 : 20;
    const eccCodes = generateRSCodes(dataBytes, eccWords);
    
    // データビットとエラー訂正ビットを結合
    const allData: number[] = [];
    [...dataBytes, ...eccCodes].forEach(byte => {
      for (let i = 7; i >= 0; i--) {
        allData.push((byte >> i) & 1);
      }
    });
    
    // データの配置
    placeData(matrix, allData);
    
    // フォーマット情報の配置
    const formatBits = [0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0]; // Lレベル、マスク000
    placeFormatInfo(matrix, formatBits);
    
    return matrix;
  };

  // Canvasに描画
  const drawQRCode = (matrix: QRCodeMatrix, size: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = size;
    canvas.height = size;

    const moduleSize = size / matrix.length;
    
    // 背景を白で塗りつぶし
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);
    
    // QRコードの描画
    ctx.fillStyle = '#000000';
    for (let y = 0; y < matrix.length; y++) {
      for (let x = 0; x < matrix.length; x++) {
        if (matrix[y][x].value === 1) {
          ctx.fillRect(x * moduleSize, y * moduleSize, moduleSize, moduleSize);
        }
      }
    }
    
    // DataURLを生成
    const dataUrl = canvas.toDataURL('image/png');
    setQrCodeDataUrl(dataUrl);
  };

  // QRコードの生成処理
  const handleGenerate = async () => {
    if (!inputText.trim()) {
      setError('URLまたはテキストを入力してください');
      setQrCodeDataUrl('');
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);
      
      const matrix = generateQRCode(inputText.trim());
      const size = parseInt(selectedSize);
      drawQRCode(matrix, size);
    } catch (err) {
      console.error('QRコード生成エラー:', err);
      setError(err instanceof Error ? err.message : 'QRコード生成中にエラーが発生しました');
      setQrCodeDataUrl('');
    } finally {
      setIsGenerating(false);
    }
  };

  // ダウンロード処理
  const handleDownload = () => {
    if (!qrCodeDataUrl) {
      setError('ダウンロードするQRコードがありません');
      return;
    }

    const link = document.createElement('a');
    link.href = qrCodeDataUrl;
    link.download = `qrcode_${selectedSize}x${selectedSize}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 入力変更時の自動生成
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputText.trim()) {
        handleGenerate();
      } else {
        setQrCodeDataUrl('');
        setError(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [inputText, selectedSize]);

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card className="p-6 bg-[#1c2128] border-gray-700">
        <div className="flex flex-col space-y-6">
          {/* コントロール部分 */}
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="w-full md:w-2/3">
              <Label className="text-gray-300 mb-2 block">URL・テキスト入力</Label>
              <input
                type="text"
                className="w-full p-3 bg-[#0d1117] border border-gray-700 rounded-lg text-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="QRコードに変換するURLやテキストを入力してください"
                disabled={isGenerating}
              />
            </div>
            <div className="w-full md:w-1/3">
              <Label className="text-gray-300 mb-2 block">サイズ選択</Label>
              <Select
                value={selectedSize}
                onValueChange={setSelectedSize}
                disabled={isGenerating}
              >
                <SelectTrigger className="w-full bg-[#21262d] border-gray-600 text-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#21262d] border-gray-600">
                  {sizeOptions.map(option => (
                    <SelectItem 
                      key={option.id} 
                      value={option.id}
                      className="text-gray-200 hover:bg-[#30363d]"
                    >
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* QRコード表示部分 */}
          <div className="flex flex-col items-center space-y-4">
            {qrCodeDataUrl && (
              <div className="bg-white p-4 rounded-lg">
                <img 
                  src={qrCodeDataUrl} 
                  alt="Generated QR Code"
                  className="max-w-full h-auto"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
            )}
            
            {!qrCodeDataUrl && !error && !isGenerating && (
              <div className="w-64 h-64 bg-[#0d1117] border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center">
                <span className="text-gray-500 text-center">
                  URLやテキストを入力すると<br />QRコードがここに表示されます
                </span>
              </div>
            )}

            {isGenerating && (
              <div className="w-64 h-64 bg-[#0d1117] border border-gray-700 rounded-lg flex items-center justify-center">
                <span className="text-gray-400">生成中...</span>
              </div>
            )}

            {qrCodeDataUrl && (
              <Button
                onClick={handleDownload}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                disabled={isGenerating}
              >
                PNG形式でダウンロード
              </Button>
            )}
          </div>

          {/* エラー表示 */}
          {error && (
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
              <div className="text-red-400">{error}</div>
            </div>
          )}
        </div>
      </Card>
      
      {/* 非表示のCanvas（QRコード生成用） */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default QrGenerator;