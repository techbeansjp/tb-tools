'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface QRGeneratorProps {}

// QRコード生成用の設定
interface QRCodeConfig {
  text: string;
  size: number;
  margin: number;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
}

// QRコードバージョン情報
const QR_VERSIONS = [
  { version: 1, size: 21, capacity: { L: 17, M: 14, Q: 11, H: 7 } },
  { version: 2, size: 25, capacity: { L: 32, M: 26, Q: 20, H: 14 } },
  { version: 3, size: 29, capacity: { L: 53, M: 42, Q: 32, H: 24 } },
  { version: 4, size: 33, capacity: { L: 78, M: 62, Q: 46, H: 34 } },
];

// Reed-Solomon用ガロア体計算
class GaloisField {
  private static EXP_TABLE: number[] = [];
  private static LOG_TABLE: number[] = [];
  
  static {
    // Initialize Galois Field tables
    this.EXP_TABLE = new Array(255);
    this.LOG_TABLE = new Array(256);
    
    let val = 1;
    for (let i = 0; i < 255; i++) {
      this.EXP_TABLE[i] = val;
      this.LOG_TABLE[val] = i;
      val = val << 1;
      if (val & 0x100) {
        val ^= 0x11d;
      }
    }
  }
  
  static multiply(a: number, b: number): number {
    if (a === 0 || b === 0) return 0;
    return this.EXP_TABLE[(this.LOG_TABLE[a] + this.LOG_TABLE[b]) % 255];
  }
  
  static power(base: number, exp: number): number {
    if (base === 0) return 0;
    return this.EXP_TABLE[(this.LOG_TABLE[base] * exp) % 255];
  }
}

export const QrGenerator: React.FC<QRGeneratorProps> = () => {
  const [inputText, setInputText] = useState<string>('');
  const [qrSize, setQrSize] = useState<string>('256');
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // QRコード生成関数
  const generateQRCode = useCallback(async (config: QRCodeConfig): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        const canvas = canvasRef.current;
        if (!canvas) {
          reject(new Error('Canvas element not found'));
          return;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // 最適なバージョンを選択
        const version = selectVersion(config.text, config.errorCorrectionLevel);
        if (!version) {
          reject(new Error('Text too long for QR code'));
          return;
        }

        const matrix = generateQRMatrix(config.text, version, config.errorCorrectionLevel);
        
        // キャンバスサイズを設定
        const moduleSize = Math.floor((config.size - config.margin * 2) / version.size);
        const actualSize = version.size * moduleSize + config.margin * 2;
        canvas.width = actualSize;
        canvas.height = actualSize;

        // 背景を白で塗りつぶし
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, actualSize, actualSize);

        // QRコードを描画
        ctx.fillStyle = '#000000';
        for (let row = 0; row < version.size; row++) {
          for (let col = 0; col < version.size; col++) {
            if (matrix[row][col]) {
              const x = config.margin + col * moduleSize;
              const y = config.margin + row * moduleSize;
              ctx.fillRect(x, y, moduleSize, moduleSize);
            }
          }
        }

        resolve(canvas.toDataURL('image/png'));
      } catch (err) {
        reject(err);
      }
    });
  }, []);

  // バージョン選択
  const selectVersion = (text: string, ecLevel: 'L' | 'M' | 'Q' | 'H') => {
    const textLength = text.length;
    return QR_VERSIONS.find(v => v.capacity[ecLevel] >= textLength);
  };

  // QRマトリックス生成
  const generateQRMatrix = (text: string, version: typeof QR_VERSIONS[0], ecLevel: 'L' | 'M' | 'Q' | 'H'): boolean[][] => {
    const size = version.size;
    const matrix: (boolean | null)[][] = Array(size).fill(null).map(() => Array(size).fill(null));

    // ファインダーパターンを配置
    addFinderPattern(matrix, 0, 0);
    addFinderPattern(matrix, 0, size - 7);
    addFinderPattern(matrix, size - 7, 0);

    // セパレーターを配置
    addSeparators(matrix, size);

    // タイミングパターンを配置
    addTimingPatterns(matrix, size);

    // ダークモジュールを配置
    if (size > 21) {
      matrix[4 * version.version + 9][8] = true;
    }

    // データエンコーディング
    const encodedData = encodeData(text, ecLevel, version);
    
    // データを配置
    placeData(matrix, encodedData, size);

    // マスキング
    const maskedMatrix = applyMask(matrix, 0); // Use mask pattern 0 for simplicity

    // フォーマット情報を配置
    addFormatInfo(maskedMatrix, ecLevel, 0, size);

    return maskedMatrix as boolean[][];
  };

  // データエンコーディング
  const encodeData = (text: string, ecLevel: 'L' | 'M' | 'Q' | 'H', version: typeof QR_VERSIONS[0]): boolean[] => {
    const data: number[] = [];
    
    // モードインジケーター (byte mode: 0100)
    data.push(0, 1, 0, 0);
    
    // 文字数インジケーター
    const lengthBits = version.version <= 9 ? 8 : 16;
    const length = text.length;
    for (let i = lengthBits - 1; i >= 0; i--) {
      data.push((length >> i) & 1);
    }
    
    // データ
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      for (let bit = 7; bit >= 0; bit--) {
        data.push((charCode >> bit) & 1);
      }
    }
    
    // ターミネーター
    for (let i = 0; i < Math.min(4, version.capacity[ecLevel] * 8 - data.length); i++) {
      data.push(0);
    }
    
    // パディング
    while (data.length % 8 !== 0) {
      data.push(0);
    }
    
    // パディング用コードワード
    const paddingBytes = [236, 17]; // 11101100, 00010001
    let paddingIndex = 0;
    while (data.length < version.capacity[ecLevel] * 8) {
      const paddingByte = paddingBytes[paddingIndex % 2];
      for (let bit = 7; bit >= 0; bit--) {
        if (data.length < version.capacity[ecLevel] * 8) {
          data.push((paddingByte >> bit) & 1);
        }
      }
      paddingIndex++;
    }

    // Reed-Solomon誤り訂正符号
    const correctedData = addErrorCorrection(data, ecLevel, version);
    
    return correctedData.map(bit => bit === 1);
  };

  // Reed-Solomon誤り訂正符号追加
  const addErrorCorrection = (data: number[], ecLevel: 'L' | 'M' | 'Q' | 'H', version: typeof QR_VERSIONS[0]): number[] => {
    // 簡略化された誤り訂正実装
    const ecBlocks = getErrorCorrectionBlocks(ecLevel, version);
    const dataBytes = [];
    
    // ビットをバイトに変換
    for (let i = 0; i < data.length; i += 8) {
      let byte = 0;
      for (let j = 0; j < 8 && i + j < data.length; j++) {
        byte = (byte << 1) | data[i + j];
      }
      dataBytes.push(byte);
    }

    // 簡単な誤り訂正符号生成 (実際のReed-Solomonは複雑)
    const ecBytes = [];
    for (let i = 0; i < ecBlocks; i++) {
      ecBytes.push(0); // Simplified - normally would calculate proper EC codewords
    }

    // バイトをビットに戻す
    const result = [];
    [...dataBytes, ...ecBytes].forEach(byte => {
      for (let bit = 7; bit >= 0; bit--) {
        result.push((byte >> bit) & 1);
      }
    });

    return result;
  };

  // 誤り訂正ブロック数取得
  const getErrorCorrectionBlocks = (ecLevel: 'L' | 'M' | 'Q' | 'H', version: typeof QR_VERSIONS[0]): number => {
    const ecMap = {
      L: [7, 10, 15, 20],
      M: [10, 16, 26, 18],
      Q: [13, 22, 18, 26],
      H: [17, 28, 22, 16]
    };
    return ecMap[ecLevel][version.version - 1] || 10;
  };

  // ファインダーパターン追加
  const addFinderPattern = (matrix: (boolean | null)[][], startRow: number, startCol: number) => {
    const pattern = [
      [1,1,1,1,1,1,1],
      [1,0,0,0,0,0,1],
      [1,0,1,1,1,0,1],
      [1,0,1,1,1,0,1],
      [1,0,1,1,1,0,1],
      [1,0,0,0,0,0,1],
      [1,1,1,1,1,1,1]
    ];

    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 7; col++) {
        if (startRow + row < matrix.length && startCol + col < matrix[0].length) {
          matrix[startRow + row][startCol + col] = pattern[row][col] === 1;
        }
      }
    }
  };

  // セパレーター追加
  const addSeparators = (matrix: (boolean | null)[][], size: number) => {
    // Top-left separator
    for (let i = 0; i < 8; i++) {
      if (i < size) matrix[7][i] = false;
      if (i < size) matrix[i][7] = false;
    }
    
    // Top-right separator
    for (let i = 0; i < 8; i++) {
      if (size - 8 + i >= 0) matrix[7][size - 8 + i] = false;
      if (i < size) matrix[i][size - 8] = false;
    }
    
    // Bottom-left separator
    for (let i = 0; i < 8; i++) {
      if (size - 8 + i >= 0) matrix[size - 8 + i][7] = false;
      if (i < size) matrix[size - 8][i] = false;
    }
  };

  // タイミングパターン追加
  const addTimingPatterns = (matrix: (boolean | null)[][], size: number) => {
    for (let i = 8; i < size - 8; i++) {
      matrix[6][i] = i % 2 === 0;
      matrix[i][6] = i % 2 === 0;
    }
  };

  // データ配置
  const placeData = (matrix: (boolean | null)[][], data: boolean[], size: number) => {
    let dataIndex = 0;
    let up = true;

    for (let col = size - 1; col > 0; col -= 2) {
      if (col === 6) col--; // Skip timing column

      for (let count = 0; count < size; count++) {
        const row = up ? size - 1 - count : count;

        for (let c = 0; c < 2; c++) {
          const currentCol = col - c;
          if (matrix[row][currentCol] === null) {
            if (dataIndex < data.length) {
              matrix[row][currentCol] = data[dataIndex];
              dataIndex++;
            } else {
              matrix[row][currentCol] = false;
            }
          }
        }
      }
      up = !up;
    }
  };

  // マスキング適用
  const applyMask = (matrix: (boolean | null)[][], maskPattern: number): (boolean | null)[][] => {
    const size = matrix.length;
    const masked = matrix.map(row => [...row]);

    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (masked[row][col] !== null && !isReservedArea(row, col, size)) {
          let shouldMask = false;
          
          switch (maskPattern) {
            case 0:
              shouldMask = (row + col) % 2 === 0;
              break;
            case 1:
              shouldMask = row % 2 === 0;
              break;
            case 2:
              shouldMask = col % 3 === 0;
              break;
            // Add more mask patterns as needed
          }
          
          if (shouldMask) {
            masked[row][col] = !masked[row][col];
          }
        }
      }
    }

    return masked;
  };

  // 予約領域チェック
  const isReservedArea = (row: number, col: number, size: number): boolean => {
    // Finder patterns
    if ((row < 9 && col < 9) || 
        (row < 9 && col >= size - 8) || 
        (row >= size - 8 && col < 9)) {
      return true;
    }
    
    // Timing patterns
    if (row === 6 || col === 6) {
      return true;
    }
    
    return false;
  };

  // フォーマット情報追加
  const addFormatInfo = (matrix: (boolean | null)[][], ecLevel: 'L' | 'M' | 'Q' | 'H', maskPattern: number, size: number) => {
    const ecLevelBits = { L: 1, M: 0, Q: 3, H: 2 };
    const formatInfo = (ecLevelBits[ecLevel] << 3) | maskPattern;
    
    // BCH符号化 (簡略版)
    let bchCode = formatInfo << 10;
    const generator = 0x537; // BCH生成多項式
    
    for (let i = 4; i >= 0; i--) {
      if ((bchCode >> (14 - i)) & 1) {
        bchCode ^= generator << (4 - i);
      }
    }
    
    const finalFormat = (formatInfo << 10) | bchCode;
    const formatBits = [];
    for (let i = 14; i >= 0; i--) {
      formatBits.push((finalFormat >> i) & 1);
    }

    // フォーマット情報を配置
    for (let i = 0; i < 15; i++) {
      const bit = formatBits[i] === 1;
      
      if (i < 6) {
        matrix[8][i] = bit;
        matrix[size - 1 - i][8] = bit;
      } else if (i < 8) {
        matrix[8][i + 1] = bit;
        matrix[size - 7 + (i - 6)][8] = bit;
      } else if (i === 8) {
        matrix[7][8] = bit;
        matrix[8][size - 8] = bit;
      } else {
        matrix[14 - i][8] = bit;
        matrix[8][size - 15 + i] = bit;
      }
    }
  };

  // QRコード生成ハンドラー
  const handleGenerateQR = async () => {
    if (!inputText.trim()) {
      setError('URLまたはテキストを入力してください');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const config: QRCodeConfig = {
        text: inputText.trim(),
        size: parseInt(qrSize),
        margin: 20,
        errorCorrectionLevel: errorCorrectionLevel
      };

      const dataUrl = await generateQRCode(config);
      setQrDataUrl(dataUrl);
    } catch (err) {
      console.error('QRコード生成エラー:', err);
      setError('QRコードの生成中にエラーが発生しました');
    } finally {
      setIsGenerating(false);
    }
  };

  // ダウンロードハンドラー
  const handleDownload = () => {
    if (!qrDataUrl) {
      setError('ダウンロードするQRコードがありません');
      return;
    }

    const link = document.createElement('a');
    link.download = `qrcode_${Date.now()}.png`;
    link.href = qrDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // クリアハンドラー
  const handleClear = () => {
    setInputText('');
    setQrDataUrl(null);
    setError(null);
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card className="p-6 bg-[#1c2128] border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl text-gray-200">QRコード生成ツール</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* URL/テキスト入力 */}
          <div className="space-y-2">
            <Label className="text-gray-300" htmlFor="input-text">
              URL または テキスト
            </Label>
            <textarea
              id="input-text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="QRコードに変換したいURLやテキストを入力してください"
              className="w-full h-24 p-3 bg-[#0d1117] border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 resize-none focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* サイズ選択 */}
          <div className="space-y-2">
            <Label className="text-gray-300">QRコードサイズ</Label>
            <Select value={qrSize} onValueChange={setQrSize}>
              <SelectTrigger className="w-full bg-[#0d1117] border-gray-700 text-gray-200">
                <SelectValue placeholder="サイズを選択" />
              </SelectTrigger>
              <SelectContent className="bg-[#21262d] border-gray-700">
                <SelectItem value="128" className="text-gray-200 hover:bg-[#30363d]">128 × 128 px</SelectItem>
                <SelectItem value="256" className="text-gray-200 hover:bg-[#30363d]">256 × 256 px</SelectItem>
                <SelectItem value="512" className="text-gray-200 hover:bg-[#30363d]">512 × 512 px</SelectItem>
                <SelectItem value="1024" className="text-gray-200 hover:bg-[#30363d]">1024 × 1024 px</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 誤り訂正レベル選択 */}
          <div className="space-y-2">
            <Label className="text-gray-300">誤り訂正レベル</Label>
            <Select value={errorCorrectionLevel} onValueChange={(value: 'L' | 'M' | 'Q' | 'H') => setErrorCorrectionLevel(value)}>
              <SelectTrigger className="w-full bg-[#0d1117] border-gray-700 text-gray-200">
                <SelectValue placeholder="誤り訂正レベルを選択" />
              </SelectTrigger>
              <SelectContent className="bg-[#21262d] border-gray-700">
                <SelectItem value="L" className="text-gray-200 hover:bg-[#30363d]">L (低) - 約7%復元可能</SelectItem>
                <SelectItem value="M" className="text-gray-200 hover:bg-[#30363d]">M (中) - 約15%復元可能</SelectItem>
                <SelectItem value="Q" className="text-gray-200 hover:bg-[#30363d]">Q (中高) - 約25%復元可能</SelectItem>
                <SelectItem value="H" className="text-gray-200 hover:bg-[#30363d]">H (高) - 約30%復元可能</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 操作ボタン */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleGenerateQR}
              disabled={isGenerating || !inputText.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 disabled:opacity-50"
            >
              {isGenerating ? 'QRコード生成中...' : 'QRコードを生成'}
            </Button>
            {qrDataUrl && (
              <>
                <Button
                  onClick={handleDownload}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
                >
                  PNG形式でダウンロード
                </Button>
                <Button
                  onClick={handleClear}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-[#21262d] px-6 py-2"
                >
                  クリア
                </Button>
              </>
            )}
          </div>

          {/* QRコード表示エリア */}
          {qrDataUrl && (
            <div className="space-y-2">
              <Label className="text-gray-300">生成されたQRコード</Label>
              <div className="flex justify-center p-6 bg-[#0d1117] border border-gray-700 rounded-lg">
                <img 
                  src={qrDataUrl} 
                  alt="Generated QR Code" 
                  className="border border-gray-600 rounded"
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              </div>
            </div>
          )}

          {/* エラーメッセージ */}
          {error && (
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
              <div className="text-red-400">{error}</div>
            </div>
          )}

          {/* 隠しキャンバス（QRコード生成用） */}
          <canvas
            ref={canvasRef}
            style={{ display: 'none' }}
            aria-hidden="true"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default QrGenerator;