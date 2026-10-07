/* Serves dist/ under the same sub-path GitHub Pages uses (/laila-care/), gzipped,
   with the same 404 behaviour, so localhost behaves like production. */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { SITE } from '../src/config.js';

const ROOT = path.resolve(import.meta.dirname, '../dist');
const BASE = (process.env.BASE_PATH ?? SITE.basePath).replace(/\/$/, '');
const PORT = Number(process.env.PORT || 4221);
const T = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.avif': 'image/avif', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.json': 'application/json', '.webmanifest': 'application/manifest+json',
  '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8' };
const ZIP = new Set(['.html', '.css', '.js', '.svg', '.json', '.xml', '.txt', '.webmanifest']);

http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/' && BASE) { res.writeHead(302, { location: BASE + '/' }); return res.end(); }
  if (BASE && !p.startsWith(BASE + '/') && p !== BASE) return send404(res);
  p = p.slice(BASE.length) || '/';
  if (p.endsWith('/')) p += 'index.html';
  let f = path.join(ROOT, p);
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) { res.writeHead(301, { location: req.url.split('?')[0] + '/' }); return res.end(); }
  if (!f.startsWith(ROOT) || !fs.existsSync(f)) return send404(res);
  send(res, f, 200, req);
}).listen(PORT, () => console.log(`Laila Care on http://localhost:${PORT}${BASE}/`));

function send404(res) { send(res, path.join(ROOT, '404.html'), 404, { headers: {} }); }
function send(res, f, status, req) {
  const ext = path.extname(f);
  const head = { 'content-type': T[ext] || 'application/octet-stream', 'cache-control': ext === '.html' ? 'no-cache' : 'public, max-age=600' };
  const body = fs.readFileSync(f);
  if (ZIP.has(ext) && /\bgzip\b/.test(req.headers['accept-encoding'] || '')) {
    const gz = zlib.gzipSync(body, { level: 9 });
    res.writeHead(status, { ...head, 'content-encoding': 'gzip', 'content-length': gz.length });
    return res.end(gz);
  }
  res.writeHead(status, { ...head, 'content-length': body.length });
  res.end(body);
}
