'use client';

import { useState, useRef } from 'react';
import ColorSquare from './ColorSquare';
import ColorValues from './ColorValues';
import ColorPreview from './ColorPreview';
import ColorPalette from './ColorPalette';
import ColorSlider from './ColorSlider';

interface Color {
  hex: string;
  rgb: {
    r: number;
    g: number;
    b: number;
  };
  hsl: {
    h: number;
    s: number;
    l: number;
  };
}

const ColorPicker = () => {
  const [color, setColor] = useState<Color>({
    hex: '#000000',
    rgb: { r: 0, g: 0, b: 0 },
    hsl: { h: 0, s: 0, l: 0 }
  });
  const initialColorRef = useRef<Color>(color);

  // 色相スライダーでhueのみ更新
  const handleHueChange = (newColor: Color) => {
    setColor(prev => ({
      hex: hslToHex(newColor.hsl.h, prev.hsl.s, prev.hsl.l),
      rgb: hslToRgb(newColor.hsl.h, prev.hsl.s, prev.hsl.l),
      hsl: { h: newColor.hsl.h, s: prev.hsl.s, l: prev.hsl.l }
    }));
  };

  // カラースクエアでs/lを更新
  const handleSquareChange = (c: { h: number; s: number; l: number; hex: string; rgb: { r: number; g: number; b: number } }) => {
    setColor({
      hex: c.hex,
      rgb: c.rgb,
      hsl: { h: color.hsl.h, s: c.s, l: c.l }
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex gap-4">
        <div className="flex gap-4">
          <ColorSquare
            hue={color.hsl.h}
            saturation={color.hsl.s}
            lightness={color.hsl.l}
            onChange={handleSquareChange}
          />
          <ColorSlider
            hue={color.hsl.h}
            onColorChange={handleHueChange}
            value={{ s: color.hsl.s, l: color.hsl.l }}
          />
        </div>
        <ColorValues color={color} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ColorPreview color={color} />
        <ColorPalette baseColor={color} onColorSelect={setColor} />
      </div>
      <div className="bg-[#161b22] rounded-xl p-6 shadow-md border border-gray-800 max-w-md mx-auto">
        <h2 className="text-lg font-semibold mb-4 text-gray-200">最初に選択した色</h2>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-lg border border-gray-700" style={{ backgroundColor: initialColorRef.current.hex }} />
          <div>
            <div className="text-sm text-gray-400">HEX: <span className="text-gray-200">{initialColorRef.current.hex}</span></div>
            <div className="text-sm text-gray-400">RGB: <span className="text-gray-200">rgb({initialColorRef.current.rgb.r}, {initialColorRef.current.rgb.g}, {initialColorRef.current.rgb.b})</span></div>
            <div className="text-sm text-gray-400">HSL: <span className="text-gray-200">hsl({Math.round(initialColorRef.current.hsl.h)}, {Math.round(initialColorRef.current.hsl.s)}%, {Math.round(initialColorRef.current.hsl.l)}%)</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// HSL→HEX/RGB変換関数
function hslToHex(h: number, s: number, l: number): string {
  const rgb = hslToRgb(h, s, l);
  return `#${rgb.r.toString(16).padStart(2, '0')}${rgb.g.toString(16).padStart(2, '0')}${rgb.b.toString(16).padStart(2, '0')}`;
}
function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return {
    r: Math.round(255 * f(0)),
    g: Math.round(255 * f(8)),
    b: Math.round(255 * f(4))
  };
}

export default ColorPicker; 