import fs from 'node:fs';
import zlib from 'node:zlib';
import path from 'node:path';

function crc32(buf) {
  let table = new Int32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ -1) >>> 0;
}

function createChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);
  const crcVal = crc32(body);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal, 0);
  return Buffer.concat([len, body, crcBuf]);
}

function generatePNG(width, height, isMaskable = false) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth: 8
  ihdrData[9] = 6; // color type: 6 (RGBA)
  ihdrData[10] = 0; // compression method
  ihdrData[11] = 0; // filter method
  ihdrData[12] = 0; // interlace method
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Raw image data with scanline filter 0
  const rowBytes = width * 4 + 1;
  const raw = Buffer.alloc(rowBytes * height);

  const cx = width / 2;
  const cy = height / 2;
  const outerR = isMaskable ? width * 0.48 : width * 0.44;
  const hubR = width * 0.16;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowBytes;
    raw[rowOffset] = 0; // Filter byte: None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Gradient background (Emerald / Green)
      // Top-left (#047857) to Bottom-right (#10b981)
      const t = (x + y) / (width + height);
      let r = Math.round(4 + t * (16 - 4));
      let g = Math.round(120 + t * (185 - 120));
      let b = Math.round(87 + t * (129 - 87));
      let a = 255;

      if (!isMaskable) {
        // Rounded corners for normal icon
        const cornerR = width * 0.22;
        const inLeft = x < cornerR;
        const inRight = x > width - cornerR;
        const inTop = y < cornerR;
        const inBottom = y > height - cornerR;
        if ((inLeft || inRight) && (inTop || inBottom)) {
          const cornerCx = inLeft ? cornerR : width - cornerR;
          const cornerCy = inTop ? cornerR : height - cornerR;
          const cornerDist = Math.hypot(x - cornerCx, y - cornerCy);
          if (cornerDist > cornerR) {
            a = 0; // transparent outside rounded corner
          }
        }
      }

      // Draw Center Hub (white rounded card)
      if (Math.abs(dx) < hubR && Math.abs(dy) < hubR) {
        r = 255; g = 255; b = 255;
        // Text / icon stripes inside hub
        if (Math.abs(dy) < hubR * 0.6 && Math.abs(dx) < hubR * 0.7 && y % 6 < 3) {
          r = 5; g = 150; b = 105;
        }
      }

      // Orbit nodes (P, H, V, A)
      const orbitR = width * 0.32;
      const nodeR = width * 0.07;
      // Top node (Plan)
      if (Math.hypot(x - cx, y - (cy - orbitR)) < nodeR) {
        r = 255; g = 255; b = 255;
      }
      // Right node (Hacer)
      if (Math.hypot(x - (cx + orbitR), y - cy) < nodeR) {
        r = 255; g = 255; b = 255;
      }
      // Bottom node (Verificar)
      if (Math.hypot(x - cx, y - (cy + orbitR)) < nodeR) {
        r = 255; g = 255; b = 255;
      }
      // Left node (Actuar) - Orange Accent
      if (Math.hypot(x - (cx - orbitR), y - cy) < nodeR) {
        r = 249; g = 115; b = 22; // Orange #f97316
      }

      raw[pxOffset] = r;
      raw[pxOffset + 1] = g;
      raw[pxOffset + 2] = b;
      raw[pxOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(raw, { level: 9 });
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Write 192x192
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), generatePNG(192, 192, false));
console.log('Generated pwa-192x192.png');

// Write 512x512
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), generatePNG(512, 512, false));
console.log('Generated pwa-512x512.png');

// Write maskable 512x512
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), generatePNG(512, 512, true));
console.log('Generated pwa-maskable-512x512.png');

// Write apple-touch-icon 180x180
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), generatePNG(180, 180, false));
console.log('Generated apple-touch-icon.png');

// Write favicon
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), generatePNG(64, 64, false));
console.log('Generated favicon.ico');
