'use client';

import { useState, useRef, useEffect } from 'react';
import { hslToHex, hslToRgb } from '@/lib/colorUtils';
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
  const [isFirstSelection, setIsFirstSelection] = useState(true);
  
  useEffect(() => {
    if (isFirstSelection && (color.hsl.s > 0 || color.hsl.l > 0)) {
      initialColorRef.current = { ...color };
      setIsFirstSelection(false);
    }
  }, [color, isFirstSelection]);

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


export default ColorPicker;        