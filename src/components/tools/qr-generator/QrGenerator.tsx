'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

// QR Code specifications and utilities
const QR_VERSIONS = [
  { version: 1, size: 21, maxData: 152 },
  { version: 2, size: 25, maxData: 272 },
  { version: 3, size: 29, maxData: 440 },
  { version: 4, size: 33, maxData: 640 }
];

const ERROR_CORRECTION_LEVELS = {
  L: 0, // Low ~7%
  M: 1, // Medium ~15%
  Q: 2, // Quartile ~25%
  H: 3  // High ~30%
} as const;

type ErrorCorrectionLevel = keyof typeof ERROR_CORRECTION_LEVELS;
type QRSize = 128 | 256 | 512 | 1024;

interface QRSizeOption {
  value: QRSize;
  label: string;
}

interface QRCodeData {
  version: number;
  size: number;
  modules: boolean[][];
}

// Galois Field arithmetic for Reed-Solomon error correction
class GaloisField {
  private static readonly PRIMITIVE_POLYNOMIAL = 0x11D; // x^8 + x^4 + x^3 + x^2 + 1
  private static readonly FIELD_SIZE = 256;
  
  private static expTable: number[] = [];
  private static logTable: number[] = [];
  
  static {
    // Initialize Galois Field tables
    this.expTable[0] = 1;
    for (let i = 1; i < this.FIELD_SIZE; i++) {
      this.expTable[i] = this.expTable[i - 1] * 2;
      if (this.expTable[i] >= this.FIELD_SIZE) {
        this.expTable[i] ^= this.PRIMITIVE_POLYNOMIAL;
      }
    }
    
    for (let i = 0; i < this.FIELD_SIZE - 1; i++) {
      this.logTable[this.expTable[i]] = i;
    }
  }
  
  static multiply(a: number, b: number): number {
    if (a === 0 || b === 0) return 0;
    return this.expTable[(this.logTable[a] + this.logTable[b]) % (this.FIELD_SIZE - 1)];
  }
  
  static divide(a: number, b: number): number {
    if (a === 0) return 0;
    if (b === 0) throw new Error('Division by zero in Galois Field');
    return this.expTable[(this.logTable[a] - this.logTable[b] + (this.FIELD_SIZE - 1)) % (this.FIELD_SIZE - 1)];
  }
  
  static power(base: number, exponent: number): number {
    if (base === 0) return 0;
    return this.expTable[(this.logTable[base] * exponent) % (this.FIELD_SIZE - 1)];
  }
}

// Reed-Solomon encoder
class ReedSolomonEncoder {
  private polynomial: number[];
  
  constructor(eccLength: number) {
    this.polynomial = this.generatePolynomial(eccLength);
  }
  
  private generatePolynomial(eccLength: number): number[] {
    const polynomial = new Array(eccLength + 1).fill(0);
    polynomial[0] = 1;
    
    for (let i = 0; i < eccLength; i++) {
      for (let j = polynomial.length - 1; j > 0; j--) {
        polynomial[j] = polynomial[j - 1] ^ GaloisField.multiply(polynomial[j], GaloisField.expTable[i]);
      }
      polynomial[0] = GaloisField.multiply(polynomial[0], GaloisField.expTable[i]);
    }
    
    return polynomial;
  }
  
  encode(data: number[]): number[] {
    const result = [...data, ...new Array(this.polynomial.length - 1).fill(0)];
    
    for (let i = 0; i < data.length; i++) {
      const coefficient = result[i];
      if (coefficient !== 0) {
        for (let j = 1; j < this.polynomial.length; j++) {
          result[i + j] ^= GaloisField.multiply(this.polynomial[j], coefficient);
        }
      }
    }
    
    return result.slice(data.length);
  }
}

// QR Code generator
class QRCodeGenerator {
  private static readonly FINDER_PATTERN = [
    [1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1],
    [1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1],
    [1,0,0,0,0,0,1],
    [1,1,1,1,1,1,1]
  ];
  
  private static readonly TIMING_PATTERN_INTERVAL = 2;
  
  static generate(text: string, errorCorrectionLevel: ErrorCorrectionLevel = 'M'): QRCodeData {
    // Select appropriate version based on data length
    const version = this.selectVersion(text, errorCorrectionLevel);
    if (!version) {
      throw new Error('データが長すぎます');
    }
    
    const size = version.size;
    const modules = Array(size).fill(null).map(() => Array(size).fill(false));
    
    // Add finder patterns
    this.addFinderPattern(modules, 0, 0);
    this.addFinderPattern(modules, size - 7, 0);
    this.addFinderPattern(modules, 0, size - 7);
    
    // Add separator patterns
    this.addSeparators(modules, size);
    
    // Add timing patterns
    this.addTimingPatterns(modules, size);
    
    // Encode data
    const encodedData = this.encodeData(text, version, errorCorrectionLevel);
    
    // Place data in modules
    this.placeData(modules, encodedData, size);
    
    return {
      version: version.version,
      size,
      modules
    };
  }
  
  private static selectVersion(text: string, level: ErrorCorrectionLevel) {
    const dataLength = new TextEncoder().encode(text).length;
    return QR_VERSIONS.find(v => v.maxData > dataLength) || null;
  }
  
  private static addFinderPattern(modules: boolean[][], x: number, y: number) {
    for (let dy = 0; dy < 7; dy++) {
      for (let dx = 0; dx < 7; dx++) {
        if (y + dy < modules.length && x + dx < modules[0].length) {
          modules[y + dy][x + dx] = this.FINDER_PATTERN[dy][dx] === 1;
        }
      }
    }
  }
  
  private static addSeparators(modules: boolean[][], size: number) {
    // Add white borders around finder patterns
    const positions = [[0, 0], [size - 7, 0], [0, size - 7]];
    
    positions.forEach(([fx, fy]) => {
      for (let dy = -1; dy <= 7; dy++) {
        for (let dx = -1; dx <= 7; dx++) {
          const x = fx + dx;
          const y = fy + dy;
          if (x >= 0 && x < size && y >= 0 && y < size) {
            if (dx === -1 || dx === 7 || dy === -1 || dy === 7) {
              modules[y][x] = false;
            }
          }
        }
      }
    });
  }
  
  private static addTimingPatterns(modules: boolean[][], size: number) {
    for (let i = 8; i < size - 8; i++) {
      modules[6][i] = i % 2 === 0;
      modules[i][6] = i % 2 === 0;
    }
  }
  
  private static encodeData(text: string, version: { version: number; maxData: number }, level: ErrorCorrectionLevel): number[] {
    const textBytes = new TextEncoder().encode(text);
    
    // Mode indicator (4 bits) - 0100 for byte mode
    const modeIndicator = [0, 1, 0, 0];
    
    // Character count (8 bits for byte mode in versions 1-9)
    const charCount = textBytes.length;
    const charCountBits = this.numberToBits(charCount, 8);
    
    // Data bits
    const dataBits: number[] = [];
    for (const byte of textBytes) {
      dataBits.push(...this.numberToBits(byte, 8));
    }
    
    // Combine all bits
    const allBits = [...modeIndicator, ...charCountBits, ...dataBits];
    
    // Add terminator (up to 4 zero bits)
    const terminatorLength = Math.min(4, version.maxData * 8 - allBits.length);
    allBits.push(...new Array(terminatorLength).fill(0));
    
    // Pad to byte boundary
    while (allBits.length % 8 !== 0) {
      allBits.push(0);
    }
    
    // Convert to bytes
    const dataBytes: number[] = [];
    for (let i = 0; i < allBits.length; i += 8) {
      const byte = allBits.slice(i, i + 8).reduce((acc, bit, idx) => acc | (bit << (7 - idx)), 0);
      dataBytes.push(byte);
    }
    
    // Add Reed-Solomon error correction
    const eccLength = Math.floor(version.maxData * 0.3); // Approximate ECC length
    const rsEncoder = new ReedSolomonEncoder(eccLength);
    const eccBytes = rsEncoder.encode(dataBytes);
    
    return [...dataBytes, ...eccBytes];
  }
  
  private static numberToBits(num: number, length: number): number[] {
    const bits: number[] = [];
    for (let i = length - 1; i >= 0; i--) {
      bits.push((num >> i) & 1);
    }
    return bits;
  }
  
  private static placeData(modules: boolean[][], data: number[], size: number) {
    let dataIndex = 0;
    let bitIndex = 0;
    
    // Place data in zigzag pattern
    for (let col = size - 1; col > 0; col -= 2) {
      if (col === 6) col--; // Skip timing column
      
      for (let row = 0; row < size; row++) {
        const actualRow = (Math.floor((size - 1 - col) / 2) % 2 === 0) ? size - 1 - row : row;
        
        for (let c = 0; c < 2; c++) {
          const x = col - c;
          const y = actualRow;
          
          if (!this.isReserved(x, y, size)) {
            if (dataIndex < data.length) {
              const bit = (data[dataIndex] >> (7 - bitIndex)) & 1;
              modules[y][x] = bit === 1;
              
              bitIndex++;
              if (bitIndex === 8) {
                bitIndex = 0;
                dataIndex++;
              }
            }
          }
        }
      }
    }
  }
  
  private static isReserved(x: number, y: number, size: number): boolean {
    // Check finder patterns and separators
    if ((x < 9 && y < 9) || 
        (x >= size - 8 && y < 9) || 
        (x < 9 && y >= size - 8)) {
      return true;
    }
    
    // Check timing patterns
    if ((x === 6 && y >= 8 && y < size - 8) || 
        (y === 6 && x >= 8 && x < size - 8)) {
      return true;
    }
    
    return false;
  }
}

export const QrGenerator: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [qrSize, setQrSize] = useState<QRSize>(256);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const sizeOptions: QRSizeOption[] = [
    { value: 128, label: '128x128 px' },
    { value: 256, label: '256x256 px' },
    { value: 512, label: '512x512 px' },
    { value: 1024, label: '1024x1024 px' }
  ];

  const generateQRCode = useCallback(async () => {
    if (!inputText.trim()) {
      setError(null);
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      }
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);

      const qrData = QRCodeGenerator.generate(inputText, 'M');
      drawQRCode(qrData);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'QRコード生成中にエラーが発生しました';
      setError(errorMessage);
      console.error('QR Code generation error:', e);
    } finally {
      setIsGenerating(false);
    }
  }, [inputText]);

  const drawQRCode = (qrData: QRCodeData) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = qrSize;
    canvas.height = qrSize;

    const moduleSize = qrSize / qrData.size;

    // Clear canvas
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, qrSize, qrSize);

    // Draw QR modules
    ctx.fillStyle = '#000000';
    for (let y = 0; y < qrData.size; y++) {
      for (let x = 0; x < qrData.size; x++) {
        if (qrData.modules[y][x]) {
          ctx.fillRect(x * moduleSize, y * moduleSize, moduleSize, moduleSize);
        }
      }
    }
  };

  const downloadQRCode = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      setError('ダウンロードするQRコードがありません');
      return;
    }

    try {
      canvas.toBlob((blob) => {
        if (!blob) {
          setError('画像の生成に失敗しました');
          return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `qrcode-${qrSize}x${qrSize}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 'image/png');
    } catch (e) {
      setError('ダウンロード中にエラーが発生しました');
      console.error('Download error:', e);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      generateQRCode();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [generateQRCode]);

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card className="p-6 bg-[#1c2128] border-gray-700">
        <div className="flex flex-col space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="url-input" className="text-gray-300 mb-2 block">
                URL・テキスト入力
              </Label>
              <textarea
                id="url-input"
                className="w-full h-32 p-3 bg-[#0d1117] border border-gray-700 rounded-lg text-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="https://example.com または任意のテキストを入力してください"
                disabled={isGenerating}
                aria-describedby={error ? "error-message" : undefined}
              />
            </div>
            
            <div>
              <Label htmlFor="size-select" className="text-gray-300 mb-2 block">
                画像サイズ
              </Label>
              <Select
                value={qrSize.toString()}
                onValueChange={(value) => setQrSize(parseInt(value) as QRSize)}
                disabled={isGenerating}
              >
                <SelectTrigger 
                  id="size-select"
                  className="w-full bg-[#21262d] border-gray-600 text-gray-200"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#21262d] border-gray-600">
                  {sizeOptions.map(option => (
                    <SelectItem 
                      key={option.value} 
                      value={option.value.toString()}
                      className="text-gray-200 hover:bg-[#30363d]"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col items-center space-y-4">
            <div className="bg-white p-4 rounded-lg">
              <canvas
                ref={canvasRef}
                className="border border-gray-300"
                style={{ maxWidth: '100%', height: 'auto' }}
                aria-label="生成されたQRコード"
              />
            </div>
            
            <Button
              onClick={downloadQRCode}
              disabled={!inputText.trim() || isGenerating}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium border border-gray-600 text-white bg-[#21262d] hover:bg-[#30363d] disabled:opacity-50 disabled:cursor-not-allowed h-10 px-6"
            >
              {isGenerating ? 'QRコード生成中...' : 'PNG形式でダウンロード'}
            </Button>
          </div>

          {error && (
            <div 
              id="error-message"
              className="bg-red-900/20 border border-red-800 rounded-lg p-4"
              role="alert"
              aria-live="polite"
            >
              <div className="text-red-400">{error}</div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};