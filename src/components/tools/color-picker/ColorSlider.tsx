'use client';

import { useState, useEffect, useRef } from 'react';

interface ColorSliderProps {
  hue: number;
  onColorChange: (color: {
    hex: string;
    rgb: { r: number; g: number; b: number };
    hsl: { h: number; s: number; l: number };
  }) => void;
}

const ColorSlider = ({ hue, onColorChange }: ColorSliderProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const height = canvas.height;

    // 色相スライダー: 常に虹色グラデーション
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0.00, 'rgb(255, 0, 0)');    // 赤
    gradient.addColorStop(0.17, 'rgb(255, 255, 0)');  // 黄
    gradient.addColorStop(0.33, 'rgb(0, 255, 0)');    // 緑
    gradient.addColorStop(0.50, 'rgb(0, 255, 255)');  // シアン
    gradient.addColorStop(0.67, 'rgb(0, 0, 255)');    // 青
    gradient.addColorStop(0.83, 'rgb(255, 0, 255)');  // マゼンタ
    gradient.addColorStop(1.00, 'rgb(255, 0, 0)');    // 赤

    // クリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 色相スライダー: 常に虹色グラデーション
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, height);

    // インジケーター（中央の丸ポチ）
    const y = height * (1 - (hue / 360));
    ctx.beginPath();
    ctx.arc(canvas.width / 2, y, 8, 0, 2 * Math.PI);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#fff';
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(canvas.width / 2, y, 5, 0, 2 * Math.PI);
    ctx.fillStyle = '#000';
    ctx.fill();
  }, [hue]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    updateColor(e);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      updateColor(e);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const updateColor = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const y = e.clientY - rect.top;
    
    updateColorFromCoordinates(y);
  };
  
  const handleTouchEvent = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const y = touch.clientY - rect.top;
    
    updateColorFromCoordinates(y);
  };
  
  const updateColorFromCoordinates = (y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const height = canvas.height;

    // 色相の計算（0-360）
    const newHue = Math.max(0, Math.min(360, (1 - y / height) * 360));

    const color = {
      hex: hslToHex(newHue, 100, 50),
      rgb: hslToRgb(newHue, 100, 50),
      hsl: { h: newHue, s: 100, l: 50 }
    };

    onColorChange(color);
  };

  const hslToHex = (h: number, s: number, l: number): string => {
    const rgb = hslToRgb(h, s, l);
    return `#${rgb.r.toString(16).padStart(2, '0')}${rgb.g.toString(16).padStart(2, '0')}${rgb.b.toString(16).padStart(2, '0')}`;
  };

  const hslToRgb = (h: number, s: number, l: number): { r: number; g: number; b: number } => {
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
  };

  return (
    <div className="bg-[#161b22] rounded-lg shadow-lg p-4 border border-gray-800">
      <h2 className="text-lg font-semibold mb-4 text-gray-200">色相</h2>
      <div className="flex items-center">
        <canvas
          ref={canvasRef}
          width={40}
          height={300}
          style={{ width: 40, height: 300 }}
          className="cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={(e) => {
            e.preventDefault();
            setIsDragging(true);
            handleTouchEvent(e);
          }}
          onTouchMove={(e) => {
            if (!isDragging) return;
            e.preventDefault();
            handleTouchEvent(e);
          }}
          onTouchEnd={() => setIsDragging(false)}
          onTouchCancel={() => setIsDragging(false)}
        />
      </div>
    </div>
  );
};

export default ColorSlider;    