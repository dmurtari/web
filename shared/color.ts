// https://github.com/frzi/lqip-css/

type RGB = { r: number; g: number; b: number };

export function packColor11Bit(c: RGB) {
  const r = Math.round((c.r / 0xff) * 0b1111);
  const g = Math.round((c.g / 0xff) * 0b1111);
  const b = Math.round((c.b / 0xff) * 0b111);
  const packed = (r << 7) | (g << 3) | b;
  return packed;
}

export function packColor10Bit(c: RGB) {
  const r = Math.round((c.r / 0xff) * 0b111);
  const g = Math.round((c.g / 0xff) * 0b1111);
  const b = Math.round((c.b / 0xff) * 0b111);
  const packed = (r << 7) | (g << 3) | b;
  return packed;
}
