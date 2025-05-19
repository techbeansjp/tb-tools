'use client';

import { useState, useEffect, useRef } from 'react';

interface ColorWheelProps {
  onColorChange: (color: {
    hex: string;
    rgb: { r: number; g: number; b: number };
    hsl: { h: number; s: number; l: number };
  }) => void;
  value?: {
    h: number;
    s: number;
  };
}

const ColorWheel = ({ onColorChange, value }: ColorWheelProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [indicator, setIndicator] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // カラーホイールの描画
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let angle = 0; angle < 360; angle++) {
      const startAngle = (angle - 2) * Math.PI / 180;
      const endAngle = (angle + 2) * Math.PI / 180;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();

      const hue = angle;
      ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
      ctx.fill();
    }

    // インジケーターの描画
    const h = value?.h ?? 0;
    const s = value?.s ?? 100;
    const rad = (h - 90) * (Math.PI / 180);
    const r = (s / 100) * radius;
    const x = centerX + r * Math.cos(rad);
    const y = centerY + r * Math.sin(rad);
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, 2 * Math.PI);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#fff';
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI);
    ctx.fillStyle = '#000';
    ctx.fill();
    setIndicator({ x, y });
  }, [value]);

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
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    const dx = x - centerX;
    const dy = y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= radius) {
      const angle = Math.atan2(dy, dx) * 180 / Math.PI;
      const hue = (angle + 360) % 360;
      const saturation = Math.min(100, (distance / radius) * 100);

      const color = {
        hex: hslToHex(hue, saturation, 50),
        rgb: hslToRgb(hue, saturation, 50),
        hsl: { h: hue, s: saturation, l: 50 }
      };

      onColorChange(color);
    }
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
      <h2 className="text-lg font-semibold mb-4 text-gray-200">カラーホイール</h2>
      <canvas
        ref={canvasRef}
        width={300}
        height={300}
        className="w-full max-w-[300px] h-auto cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
};

export default ColorWheel; 