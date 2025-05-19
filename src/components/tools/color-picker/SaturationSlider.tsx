'use client';

import { useRef, useEffect, useState } from 'react';

interface SaturationSliderProps {
  hue: number;
  lightness: number;
  saturation: number;
  onChange: (s: number) => void;
}

const SaturationSlider = ({ hue, lightness, saturation, onChange }: SaturationSliderProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const width = canvas.width;
    const height = canvas.height;

    // グラデーションの描画（左: S=0%, 右: S=100%）
    const grad = ctx.createLinearGradient(0, 0, width, 0);
    grad.addColorStop(0, `hsl(${hue}, 0%, ${lightness}%)`);
    grad.addColorStop(1, `hsl(${hue}, 100%, ${lightness}%)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // インジケーター
    const x = (saturation / 100) * width;
    ctx.beginPath();
    ctx.arc(x, height / 2, 8, 0, 2 * Math.PI);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#fff';
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, height / 2, 5, 0, 2 * Math.PI);
    ctx.fillStyle = '#000';
    ctx.fill();
  }, [hue, lightness, saturation]);

  useEffect(() => {
    if (!isDragging) return;
    const handleMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, canvas.width));
      const s = (x / canvas.width) * 100;
      onChange(s);
    };
    const handleUp = () => setIsDragging(false);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [isDragging, onChange]);

  const handleMouseEvent = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, canvas.width));
    const s = (x / canvas.width) * 100;
    onChange(s);
  };
  
  const handleTouchEvent = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = Math.max(0, Math.min(touch.clientX - rect.left, canvas.width));
    const s = (x / canvas.width) * 100;
    onChange(s);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    handleMouseEvent(e);
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    handleMouseEvent(e);
  };

  return (
    <div className="bg-[#161b22] rounded-lg shadow-lg p-4 border border-gray-800">
      <h2 className="text-lg font-semibold mb-4 text-gray-200">彩度</h2>
      <canvas
        ref={canvasRef}
        width={240}
        height={32}
        className="w-full max-w-[240px] h-8 cursor-pointer"
        onMouseDown={handleMouseDown}
        onClick={handleClick}
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
  );
};

export default SaturationSlider;              