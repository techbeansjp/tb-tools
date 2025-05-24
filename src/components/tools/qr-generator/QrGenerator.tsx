'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Encoder, Byte } from '@nuintun/qrcode';

interface QRGeneratorProps {}

// QRコード生成用の設定
interface QRCodeConfig {
  text: string;
  size: number;
  margin: number;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
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
    const canvas = canvasRef.current;
    if (!canvas) {
      throw new Error('Canvas element not found');
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    const encoder = new Encoder({
      level: config.errorCorrectionLevel
    });

    const byteSegment = new Byte(config.text);
    const encoded = encoder.encode(byteSegment);

    const moduleCount = encoded.size;

    // キャンバスサイズを設定
    const moduleSize = Math.floor((config.size - config.margin * 2) / moduleCount);
    const actualSize = moduleCount * moduleSize + config.margin * 2;
    canvas.width = actualSize;
    canvas.height = actualSize;

    // 背景を白で塗りつぶし
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, actualSize, actualSize);

    // QRコードを描画
    ctx.fillStyle = '#000000';
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (encoded.get(col, row) === 1) {
          const x = config.margin + col * moduleSize;
          const y = config.margin + row * moduleSize;
          ctx.fillRect(x, y, moduleSize, moduleSize);
        }
      }
    }

    return canvas.toDataURL('image/png');
  }, []);

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
