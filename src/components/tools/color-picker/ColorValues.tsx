'use client';

interface ColorValuesProps {
  color: {
    hex: string;
    rgb: { r: number; g: number; b: number };
    hsl: { h: number; s: number; l: number };
  };
}

const ColorValues = ({ color }: ColorValuesProps) => {
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('クリップボードへのコピーに失敗しました:', err);
    }
  };

  return (
    <div className="bg-[#161b22] rounded-lg shadow-lg p-4 border border-gray-800">
      <h2 className="text-lg font-semibold mb-4 text-gray-200">色の値</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">HEX</label>
          <div className="flex">
            <input
              type="text"
              value={color.hex}
              readOnly
              className="flex-1 px-3 py-2 bg-[#0d1117] border border-gray-700 rounded-l-md text-gray-200"
            />
            <button
              onClick={() => copyToClipboard(color.hex)}
              className="px-4 py-2 bg-[#21262d] text-gray-200 rounded-r-md hover:bg-[#30363d] border border-gray-700"
            >
              コピー
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">RGB</label>
          <div className="flex">
            <input
              type="text"
              value={`rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`}
              readOnly
              className="flex-1 px-3 py-2 bg-[#0d1117] border border-gray-700 rounded-l-md text-gray-200"
            />
            <button
              onClick={() => copyToClipboard(`rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`)}
              className="px-4 py-2 bg-[#21262d] text-gray-200 rounded-r-md hover:bg-[#30363d] border border-gray-700"
            >
              コピー
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">HSL</label>
          <div className="flex">
            <input
              type="text"
              value={`hsl(${Math.round(color.hsl.h)}, ${Math.round(color.hsl.s)}%, ${Math.round(color.hsl.l)}%)`}
              readOnly
              className="flex-1 px-3 py-2 bg-[#0d1117] border border-gray-700 rounded-l-md text-gray-200"
            />
            <button
              onClick={() => copyToClipboard(`hsl(${Math.round(color.hsl.h)}, ${Math.round(color.hsl.s)}%, ${Math.round(color.hsl.l)}%)`)}
              className="px-4 py-2 bg-[#21262d] text-gray-200 rounded-r-md hover:bg-[#30363d] border border-gray-700"
            >
              コピー
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorValues;  