'use client';

interface ColorPreviewProps {
  color: {
    hex: string;
    rgb: { r: number; g: number; b: number };
    hsl: { h: number; s: number; l: number };
  };
}

const ColorPreview = ({ color }: ColorPreviewProps) => {
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
          >
            白文字
          </div>
          <div
            className="h-16 rounded-lg flex items-center justify-center text-black"
            style={{ backgroundColor: color.hex }}
          >
            黒文字
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorPreview; 