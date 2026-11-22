'use strict';

// Генерация PNG-иконок для PWA без внешних зависимостей.
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function crc32(buffer) {
  let crc = 0xffffffff;
  for (let i = 0; i < buffer.length; i++) {
    let c = crc ^ buffer[i];
    for (let k = 0; k < 8; k++) c = (c & 1) ? ((c >>> 1) ^ 0xedb88320) : (c >>> 1);
    crc = c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const name = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([name, data])), 0);
  return Buffer.concat([length, name, data, crc]);
}

function makePng(size, maskable) {
  const raw = Buffer.alloc(size * (size * 4 + 1));
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * (maskable ? 0.24 : 0.28);
  let offset = 0;

  for (let y = 0; y < size; y++) {
    raw[offset++] = 0; // фильтр "none"
    const t = y / (size - 1);
    for (let x = 0; x < size; x++) {
      let r = Math.round(24 + (8 - 24) * t);
      let g = Math.round(33 + (11 - 33) * t);
      let b = Math.round(61 + (20 - 61) * t);

      const dx = x - cx;
      const dy = y - cy;
      const distance = Math.hypot(dx, dy);

      if (distance > radius && distance < radius * 1.28) {
        const alpha = (1 - (distance - radius) / (radius * 0.28)) * 0.18;
        r = Math.round(r + (110 - r) * alpha);
        g = Math.round(g + (231 - g) * alpha);
        b = Math.round(b + (249 - b) * alpha);
      }

      if (distance <= radius) {
        const blend = (x + y) / (2 * size);
        r = Math.round(110 + (167 - 110) * blend);
        g = Math.round(231 + (139 - 231) * blend);
        b = Math.round(249 + (250 - 249) * blend);

        if (Math.abs(dx) + Math.abs(dy) < radius * 0.44) {
          r = 248; g = 251; b = 255;
        }
      }

      raw[offset++] = r;
      raw[offset++] = g;
      raw[offset++] = b;
      raw[offset++] = 255;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const targets = [
  ['icon-192.png', 192, false],
  ['icon-512.png', 512, false],
  ['icon-maskable-512.png', 512, true],
];

for (const [name, size, maskable] of targets) {
  fs.writeFileSync(path.join(__dirname, '..', name), makePng(size, maskable));
  console.log(`created ${name}`);
}
