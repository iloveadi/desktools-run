/**
 * Pure TypeScript QR Code generator algorithm (Byte Mode).
 * Supports standard text, URLs, and numeric data with automatic version detection.
 */

// RS Block Table & Polynomial Galois Field Tables
const GF_EXP: number[] = new Array(512);
const GF_LOG: number[] = new Array(256);

(function initGF() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x <<= 1;
    if (x & 256) x ^= 285;
  }
  for (let i = 255; i < 512; i++) {
    GF_EXP[i] = GF_EXP[i - 255];
  }
})();

function gfMul(x: number, y: number): number {
  if (x === 0 || y === 0) return 0;
  return GF_EXP[GF_LOG[x] + GF_LOG[y]];
}

function polyMul(p1: number[], p2: number[]): number[] {
  const result = new Array(p1.length + p2.length - 1).fill(0);
  for (let i = 0; i < p1.length; i++) {
    for (let j = 0; j < p2.length; j++) {
      result[i + j] ^= gfMul(p1[i], p2[j]);
    }
  }
  return result;
}

function polyMod(dividend: number[], divisor: number[]): number[] {
  const result = [...dividend];
  while (result.length >= divisor.length) {
    const coef = result[0];
    if (coef !== 0) {
      for (let i = 0; i < divisor.length; i++) {
        result[i] ^= gfMul(divisor[i], coef);
      }
    }
    result.shift();
  }
  return result;
}

function getGeneratorPoly(degree: number): number[] {
  let poly = [1];
  for (let i = 0; i < degree; i++) {
    poly = polyMul(poly, [1, GF_EXP[i]]);
  }
  return poly;
}

// QR Code Specifications for Versions 1..10 (Medium / Low ECC)
interface QRVersionSpec {
  version: number;
  size: number;
  totalBytes: number;
  dataBytes: number;
  eccBytes: number;
  alignments: number[];
}

const VERSION_SPECS: QRVersionSpec[] = [
  { version: 1, size: 21, totalBytes: 26, dataBytes: 19, eccBytes: 7, alignments: [] },
  { version: 2, size: 25, totalBytes: 44, dataBytes: 34, eccBytes: 10, alignments: [6, 18] },
  { version: 3, size: 29, totalBytes: 70, dataBytes: 55, eccBytes: 15, alignments: [6, 22] },
  { version: 4, size: 33, totalBytes: 100, dataBytes: 80, eccBytes: 20, alignments: [6, 26] },
  { version: 5, size: 37, totalBytes: 134, dataBytes: 108, eccBytes: 26, alignments: [6, 30] },
  { version: 6, size: 41, totalBytes: 172, dataBytes: 136, eccBytes: 36, alignments: [6, 34] },
  { version: 7, size: 45, totalBytes: 196, dataBytes: 156, eccBytes: 40, alignments: [6, 22, 38] },
  { version: 8, size: 49, totalBytes: 242, dataBytes: 194, eccBytes: 48, alignments: [6, 24, 42] },
  { version: 9, size: 53, totalBytes: 292, dataBytes: 232, eccBytes: 60, alignments: [6, 26, 46] },
  { version: 10, size: 57, totalBytes: 346, dataBytes: 274, eccBytes: 72, alignments: [6, 28, 50] },
];

export function generateQRCodeMatrix(text: string): boolean[][] {
  const textBytes = new TextEncoder().encode(text);
  
  // Pick smallest version that fits
  let spec = VERSION_SPECS.find((s) => s.dataBytes >= textBytes.length + 3);
  if (!spec) {
    spec = VERSION_SPECS[VERSION_SPECS.length - 1]; // Cap at version 10
  }

  const { size, dataBytes, eccBytes, alignments } = spec;

  // 1. Bit Buffer Construction (Byte Mode: 0100)
  const bitBuf: number[] = [];
  function pushBits(val: number, len: number) {
    for (let i = len - 1; i >= 0; i--) {
      bitBuf.push((val >> i) & 1);
    }
  }

  pushBits(0b0100, 4); // Byte Mode Indicator
  pushBits(Math.min(textBytes.length, 255), 8); // Count
  for (let i = 0; i < textBytes.length && bitBuf.length < dataBytes * 8; i++) {
    pushBits(textBytes[i], 8);
  }

  // Terminator & Padding
  while (bitBuf.length < dataBytes * 8 && bitBuf.length % 8 !== 0) {
    bitBuf.push(0);
  }
  const padBytes = [0xec, 0x11];
  let padIdx = 0;
  while (bitBuf.length < dataBytes * 8) {
    pushBits(padBytes[padIdx % 2], 8);
    padIdx++;
  }

  // Convert bit buffer to data byte array
  const rawData: number[] = [];
  for (let i = 0; i < dataBytes; i++) {
    let byteVal = 0;
    for (let b = 0; b < 8; b++) {
      byteVal = (byteVal << 1) | bitBuf[i * 8 + b];
    }
    rawData.push(byteVal);
  }

  // 2. Reed-Solomon Error Correction
  const genPoly = getGeneratorPoly(eccBytes);
  const paddedData = [...rawData, ...new Array(eccBytes).fill(0)];
  const eccData = polyMod(paddedData, genPoly);

  const fullData = [...rawData, ...eccData];

  // 3. Grid Allocation & Fixed Pattern Placement
  const grid: (boolean | null)[][] = Array.from({ length: size }, () => new Array(size).fill(null));

  // Helper to draw rectangle
  function drawRect(r: number, c: number, w: number, h: number, val: boolean) {
    for (let y = r; y < r + h; y++) {
      for (let x = c; x < c + w; x++) {
        if (y >= 0 && y < size && x >= 0 && x < size) grid[y][x] = val;
      }
    }
  }

  // Finder Patterns (7x7 with border)
  function drawFinder(r: number, c: number) {
    drawRect(r - 1, c - 1, 9, 9, false);
    drawRect(r, c, 7, 7, true);
    drawRect(r + 1, c + 1, 5, 5, false);
    drawRect(r + 2, c + 2, 3, 3, true);
  }
  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  // Timing Patterns
  for (let i = 8; i < size - 8; i++) {
    if (grid[6][i] === null) grid[6][i] = i % 2 === 0;
    if (grid[i][6] === null) grid[i][6] = i % 2 === 0;
  }

  // Alignment Patterns
  for (const r of alignments) {
    for (const c of alignments) {
      if (
        (r === 6 && c === 6) ||
        (r === 6 && c === size - 7) ||
        (r === size - 7 && c === 6)
      ) continue;
      drawRect(r - 2, c - 2, 5, 5, true);
      drawRect(r - 1, c - 1, 3, 3, false);
      grid[r][c] = true;
    }
  }

  // Dark module
  grid[size - 8][8] = true;

  // Format info area reservation
  for (let i = 0; i < 9; i++) {
    if (grid[8][i] === null) grid[8][i] = false;
    if (grid[i][8] === null) grid[i][8] = false;
    if (grid[8][size - 1 - i] === null) grid[8][size - 1 - i] = false;
    if (grid[size - 1 - i][8] === null) grid[size - 1 - i][8] = false;
  }

  // 4. Data Placement (Zig-Zag Matrix Placement)
  const fullBits: number[] = [];
  for (const byte of fullData) {
    for (let i = 7; i >= 0; i--) {
      fullBits.push((byte >> i) & 1);
    }
  }

  let bitIdx = 0;
  let dir = -1; // Going up
  for (let c = size - 1; c > 0; c -= 2) {
    if (c === 6) c--; // Skip vertical timing pattern column
    const rStart = dir === -1 ? size - 1 : 0;
    const rEnd = dir === -1 ? -1 : size;
    const step = dir === -1 ? -1 : 1;

    for (let r = rStart; r !== rEnd; r += step) {
      for (let colOffset of [0, -1]) {
        const x = c + colOffset;
        const y = r;
        if (grid[y][x] === null) {
          const bit = bitIdx < fullBits.length ? fullBits[bitIdx++] : 0;
          // Apply Pattern Mask 0: (y + x) % 2 === 0
          const mask = (y + x) % 2 === 0;
          grid[y][x] = (bit === 1) !== mask;
        }
      }
    }
    dir = -dir;
  }

  // Convert to pure boolean matrix
  return grid.map((row) => row.map((cell) => cell === true));
}
