'use client';

import { useMemo } from 'react';

interface ColorPreviewProps {
  color: {
    hex: string;
    rgb: { r: number; g: number; b: number };
    hsl: { h: number; s: number; l: number };
  };
}

const ColorPreview = ({ color }: ColorPreviewProps) => {
  const calculateContrastRatio = useMemo(() => {
    const getRGB = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;
      return [r, g, b];
    };
    
    const calculateRelativeLuminance = (r: number, g: number, b: number) => {
      const rsrgb = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
      const gsrgb = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
      const bsrgb = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
      return 0.2126 * rsrgb + 0.7152 * gsrgb + 0.0722 * bsrgb;
    };
    
    const getContrastRatio = (color1: number, color2: number) => {
      const ratio = (Math.max(color1, color2) + 0.05) / (Math.min(color1, color2) + 0.05);
      return ratio.toFixed(2);
    };
    
    const [r, g, b] = getRGB(color.hex);
    const bgLuminance = calculateRelativeLuminance(r, g, b);
    const whiteLuminance = 1.0; // White has a relative luminance of 1
    const blackLuminance = 0.0; // Black has a relative luminance of 0
    
    const whiteRatio = getContrastRatio(bgLuminance, whiteLuminance);
    const blackRatio = getContrastRatio(bgLuminance, blackLuminance);
    
    return {
      white: Number(whiteRatio),
      black: Number(blackRatio),
      whitePass: {
        aa: Number(whiteRatio) >= 4.5,
        aaa: Number(whiteRatio) >= 7.0
      },
      blackPass: {
        aa: Number(blackRatio) >= 4.5,
        aaa: Number(blackRatio) >= 7.0
      }
    };
  }, [color.hex]);
  return (
    <div className="bg-[#161b22] rounded-lg shadow-lg p-4 border border-gray-800">
      <h2 className="text-lg font-semibold mb-4 text-gray-200">プレビュー</h2>
      <div className="space-y-4">
        <div
          className="w-full h-32 rounded-lg"
          style={{ backgroundColor: color.hex }}
        />
        <div className="grid grid-cols-2 gap-4">
          <div
            className="h-16 rounded-lg flex items-center justify-center text-white"
            style={{ backgroundColor: color.hex }}
            aria-label={`白文字のコントラスト比: ${calculateContrastRatio.white}`}
          >
            <div className="text-center">
              <div>白文字</div>
              <div className="text-xs mt-1">
                コントラスト比: {calculateContrastRatio.white}
                <span className={`ml-1 ${calculateContrastRatio.whitePass.aa ? 'text-green-400' : 'text-red-400'}`}>
                  {calculateContrastRatio.whitePass.aa ? '✓ AA' : '✗ AA'}
                </span>
                <span className={`ml-1 ${calculateContrastRatio.whitePass.aaa ? 'text-green-400' : 'text-red-400'}`}>
                  {calculateContrastRatio.whitePass.aaa ? '✓ AAA' : '✗ AAA'}
                </span>
              </div>
            </div>
          </div>
          <div
            className="h-16 rounded-lg flex items-center justify-center text-black"
            style={{ backgroundColor: color.hex }}
            aria-label={`黒文字のコントラスト比: ${calculateContrastRatio.black}`}
          >
            <div className="text-center">
              <div>黒文字</div>
              <div className="text-xs mt-1">
                コントラスト比: {calculateContrastRatio.black}
                <span className={`ml-1 ${calculateContrastRatio.blackPass.aa ? 'text-green-400' : 'text-red-400'}`}>
                  {calculateContrastRatio.blackPass.aa ? '✓ AA' : '✗ AA'}
                </span>
                <span className={`ml-1 ${calculateContrastRatio.blackPass.aaa ? 'text-green-400' : 'text-red-400'}`}>
                  {calculateContrastRatio.blackPass.aaa ? '✓ AAA' : '✗ AAA'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorPreview;    