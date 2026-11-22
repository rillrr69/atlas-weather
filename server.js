'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const port = Number(process.env.PORT) || 3000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

http.createServer(async (req, res) => {
  let url;
  let pathname;
  try {
    url = new URL(req.url, 'http://localhost');
    pathname = decodeURIComponent(url.pathname);
  } catch {
    res.writeHead(400).end('Bad request');
    return;
  }

  // Прокси для исторических курсов: не все браузеры/сети пускают запросы к Frankfurter напрямую.
  if (pathname === '/api/trend') {
    const from = url.searchParams.get('from') || '';
    const to = url.searchParams.get('to') || '';
    const start = url.searchParams.get('start') || '';
    if (!/^[A-Z]{3}$/.test(from) || !/^[A-Z]{3}$/.test(to) || !/^\d{4}-\d{2}-\d{2}$/.test(start)) {
      res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Invalid parameters');
      return;
    }
    try {
      const upstream = await fetch(`https://api.frankfurter.app/${start}..?from=${from}&to=${to}`, {
        signal: AbortSignal.timeout(10000),
      });
      const body = await upstream.text();
      res.writeHead(upstream.ok ? 200 : upstream.status, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=21600',
      });
      res.end(body);
    } catch {
      res.writeHead(502, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Upstream unavailable');
    }
    return;
  }

  if (pathname === '/') pathname = '/index.html';
  const file = path.resolve(root, `.${pathname}`);
  if (file !== root && !file.startsWith(root + path.sep)) {
    res.writeHead(403).end('Forbidden');
    return;
  }

  fs.readFile(file, (error, data) => {
    if (error) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not found');
      return;
    }
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
    });
    res.end(req.method === 'HEAD' ? undefined : data);
  });
}).listen(port, () => {
  console.log(`Атлас запущен: http://localhost:${port}`);
});
