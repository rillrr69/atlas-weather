'use strict';

/* Проверка: все id, используемые в app.js, должны существовать в index.html. */

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

const ids = [...app.matchAll(/\$\('#([A-Za-z0-9_-]+)'\)/g)].map((match) => match[1]);
const unique = [...new Set(ids)];
const missing = unique.filter((id) => !html.includes(`id="${id}"`));

if (missing.length) {
  console.error('Отсутствуют id в index.html:', missing.join(', '));
  process.exit(1);
}
console.log(`Проверено id: ${unique.length}, все найдены.`);
