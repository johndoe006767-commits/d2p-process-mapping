import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { readFile, realpath } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = await realpath(fileURLToPath(new URL('../dist/', import.meta.url)));
const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json',
  '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.wasm': 'application/wasm',
  '.gz': 'application/gzip', '.glb': 'model/gltf-binary',
};

const server = createServer(async (request, response) => {
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }
  try {
    const path = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const file = await realpath(resolve(root, '.' + (path === '/' ? '/index.html' : path)));
    if (!file.startsWith(root + sep)) {
      response.writeHead(404).end();
      return;
    }
    const data = await readFile(file);
    response.writeHead(200, {
      'Content-Type': types[extname(file)] || 'application/octet-stream',
      'Content-Length': data.length,
      'Cache-Control': 'no-store',
    });
    response.end(request.method === 'HEAD' ? undefined : data);
  } catch {
    response.writeHead(404).end();
  }
});

server.on('error', error => {
  console.error('Could not start the local site.', error.message);
  process.exitCode = 1;
});
server.listen(0, '127.0.0.1', () => {
  const url = `http://127.0.0.1:${server.address().port}/demand-to-profit.html`;
  console.log(`Open ${url} in your browser.\nKeep this window open while using the site. Press Ctrl+C to stop.`);
  if (process.platform === 'win32' && process.argv.includes('--open')) {
    const browser = spawn('explorer.exe', [url], { stdio: 'ignore' });
    browser.on('error', () => console.error('Open the address above in your browser.'));
    browser.unref();
  }
});
