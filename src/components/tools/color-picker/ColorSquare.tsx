'use client';

import { useRef, useEffect, useState } from 'react';

interface ColorSquareProps {
  hue: number;
  saturation: number;
  lightness: number;
  onChange: (color: { h: number; s: number; l: number; hex: string; rgb: { r: number; g: number; b: number } }) => void;
}

const ColorSquare = ({ hue, saturation, lightness, onChange }: ColorSquareProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const width = canvas.width;
    const height = canvas.height;

    // Photoshop風: まず色相色で塗りつぶし
    ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
    ctx.fillRect(0, 0, width, height);
    // 横方向に白→透明グラデーション（彩度）
    const whiteGrad = ctx.createLinearGradient(0, 0, width, 0);
    whiteGrad.addColorStop(0, '#fff');
    whiteGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = whiteGrad;
    ctx.fillRect(0, 0, width, height);
    // 縦方向に透明→黒グラデーション（明度）
    const blackGrad = ctx.createLinearGradient(0, 0, 0, height);
    blackGrad.addColorStop(0, 'rgba(0,0,0,0)');
    blackGrad.addColorStop(1, '#000');
    ctx.fillStyle = blackGrad;
    ctx.fillRect(0, 0, width, height);

    // インジケーター
    const x = (saturation / 100) * width;
    const y = (1 - lightness / 100) * height;
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, 2 * Math.PI);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#fff';
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, 2 * Math.PI);
    ctx.strokeStyle = '#000';
    ctx.stroke();
  }, [hue, saturation, lightness]);

  const getRelativeCoords = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { s: saturation, l: lightness };
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, canvas.width));
    const y = Math.max(0, Math.min(clientY - rect.top, canvas.height));
    const s = (x / canvas.width) * 100;
    const l = 100 - (y / canvas.height) * 100;
    return { s, l };
  };

  useEffect(() => {
    if (!isDragging) return;
    const handleMove = (e: MouseEvent) => {
      const { s, l } = getRelativeCoords(e.clientX, e.clientY);
      const hex = hslToHex(hue, s, l);
      const rgb = hslToRgb(hue, s, l);
      onChange({ h: hue, s, l, hex, rgb });
    };
    const handleUp = () => setIsDragging(false);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [isDragging, hue, onChange]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    const { s, l } = getRelativeCoords(e.clientX, e.clientY);
    const hex = hslToHex(hue, s, l);
    const rgb = hslToRgb(hue, s, l);
    onChange({ h: hue, s, l, hex, rgb });
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { s, l } = getRelativeCoords(e.clientX, e.clientY);
    const hex = hslToHex(hue, s, l);
    const rgb = hslToRgb(hue, s, l);
    onChange({ h: hue, s, l, hex, rgb });
  };

  return (
    <div className="bg-[#161b22] rounded-lg shadow-lg p-4 border border-gray-800">
      <h2 className="text-lg font-semibold mb-4 text-gray-200">カラースクエア</h2>
      <canvas
        ref={canvasRef}
        width={300}
        height={300}
        className="w-full max-w-[300px] h-auto cursor-crosshair"
        onMouseDown={handleMouseDown}
        onClick={handleClick}
      />
    </div>
  );
};

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

export default ColorSquare; 