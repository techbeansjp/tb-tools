'use client';

import { hslToHex, hslToRgb } from '@/lib/colorUtils';

interface ColorPaletteProps {
  baseColor: {
    hex: string;
    rgb: { r: number; g: number; b: number };
    hsl: { h: number; s: number; l: number };
  };
  onColorSelect?: (color: { hex: string; rgb: { r: number; g: number; b: number }; hsl: { h: number; s: number; l: number } }) => void;
}

const ColorPalette = ({ baseColor, onColorSelect }: ColorPaletteProps) => {
  const generateComplementary = (h: number) => {
    return (h + 180) % 360;
  };

  const generateAnalogous = (h: number) => {
    return [(h + 30) % 360, (h + 330) % 360];
  };

  const generateMonochromatic = (h: number, s: number, l: number) => {
    return [
      { h, s: Math.min(100, s + 20), l },
      { h, s: Math.max(0, s - 20), l },
      { h, s, l: Math.min(100, l + 20) },
      { h, s, l: Math.max(0, l - 20) }
    ];
  };


  const handleSelect = (h: number, s: number, l: number) => {
    const hex = hslToHex(h, s, l);
    const rgb = hslToRgb(h, s, l);
    const hsl = { h, s, l };
    if (onColorSelect) {
      onColorSelect({ hex, rgb, hsl });
    }
  };

  const complementaryHue = generateComplementary(baseColor.hsl.h);
  const analogousHues = generateAnalogous(baseColor.hsl.h);
  const monochromaticColors = generateMonochromatic(
    baseColor.hsl.h,
    baseColor.hsl.s,
    baseColor.hsl.l
  );

  return (
    <div className="bg-[#161b22] rounded-xl p-6 shadow-md border border-gray-800">
      <h2 className="text-lg font-semibold mb-4 text-gray-200">カラーパレット</h2>
      <p className="text-sm text-gray-400 mb-4">
        選択した色に基づいて、補色・類似色・モノクロームなどの配色例を自動生成します。デザインや配色の参考にご活用ください。
      </p>
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-gray-400 mb-2">補色</h3>
          <div className="flex gap-2">
            <div
              className="w-16 h-16 rounded-lg cursor-pointer"
              style={{ backgroundColor: baseColor.hex }}
              onClick={() => handleSelect(baseColor.hsl.h, baseColor.hsl.s, baseColor.hsl.l)}
              role="button"
              aria-label={`ベースカラー: ${baseColor.hex}`}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSelect(baseColor.hsl.h, baseColor.hsl.s, baseColor.hsl.l);
                }
              }}
            />
            <div
              className="w-16 h-16 rounded-lg cursor-pointer"
              style={{ backgroundColor: hslToHex(complementaryHue, baseColor.hsl.s, baseColor.hsl.l) }}
              onClick={() => handleSelect(complementaryHue, baseColor.hsl.s, baseColor.hsl.l)}
              role="button"
              aria-label={`補色: ${hslToHex(complementaryHue, baseColor.hsl.s, baseColor.hsl.l)}`}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSelect(complementaryHue, baseColor.hsl.s, baseColor.hsl.l);
                }
              }}
            />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-400 mb-2">類似色</h3>
          <div className="flex gap-2">
            <div
              className="w-16 h-16 rounded-lg cursor-pointer"
              style={{ backgroundColor: hslToHex(analogousHues[0], baseColor.hsl.s, baseColor.hsl.l) }}
              onClick={() => handleSelect(analogousHues[0], baseColor.hsl.s, baseColor.hsl.l)}
              role="button"
              aria-label={`類似色1: ${hslToHex(analogousHues[0], baseColor.hsl.s, baseColor.hsl.l)}`}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSelect(analogousHues[0], baseColor.hsl.s, baseColor.hsl.l);
                }
              }}
            />
            <div
              className="w-16 h-16 rounded-lg cursor-pointer"
              style={{ backgroundColor: baseColor.hex }}
              onClick={() => handleSelect(baseColor.hsl.h, baseColor.hsl.s, baseColor.hsl.l)}
              role="button"
              aria-label={`ベースカラー: ${baseColor.hex}`}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSelect(baseColor.hsl.h, baseColor.hsl.s, baseColor.hsl.l);
                }
              }}
            />
            <div
              className="w-16 h-16 rounded-lg cursor-pointer"
              style={{ backgroundColor: hslToHex(analogousHues[1], baseColor.hsl.s, baseColor.hsl.l) }}
              onClick={() => handleSelect(analogousHues[1], baseColor.hsl.s, baseColor.hsl.l)}
              role="button"
              aria-label={`類似色2: ${hslToHex(analogousHues[1], baseColor.hsl.s, baseColor.hsl.l)}`}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSelect(analogousHues[1], baseColor.hsl.s, baseColor.hsl.l);
                }
              }}
            />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-400 mb-2">モノクローム</h3>
          <div className="flex gap-2">
            {monochromaticColors.map((color, index) => (
              <div
                key={index}
                className="w-16 h-16 rounded-lg cursor-pointer"
                style={{ backgroundColor: hslToHex(color.h, color.s, color.l) }}
                onClick={() => handleSelect(color.h, color.s, color.l)}
                role="button"
                aria-label={`モノクローム${index + 1}: ${hslToHex(color.h, color.s, color.l)}`}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelect(color.h, color.s, color.l);
                  }
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};


export default ColorPalette;            