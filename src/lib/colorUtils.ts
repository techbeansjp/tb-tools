/**
 * Validates HSL color values and returns normalized values
 */
export function validateHslValue(h: number, s: number, l: number): [number, number, number] {
  const validH = ((h % 360) + 360) % 360;
  const validS = Math.max(0, Math.min(100, s));
  const validL = Math.max(0, Math.min(100, l));
  
  return [validH, validS, validL];
}

/**
 * Converts HSL color values to RGB color values
 */
export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  [h, s, l] = validateHslValue(h, s, l);
  
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

/**
 * Converts HSL color values to HEX color string
 */
export function hslToHex(h: number, s: number, l: number): string {
  const rgb = hslToRgb(h, s, l);
  return `#${rgb.r.toString(16).padStart(2, '0')}${
    rgb.g.toString(16).padStart(2, '0')
  }${rgb.b.toString(16).padStart(2, '0')}`;
}
