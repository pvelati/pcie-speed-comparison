/**
 * Prerender step (SSG): after `vite build`, load the built page in headless
 * Chromium, let the app render, then serialize the DOM back to
 * dist/index.html. The published HTML then contains the full content:
 * first paint needs no JavaScript (fast LCP), the page works with JS
 * disabled, and crawlers see everything. The module script still runs and
 * swaps in an identical live DOM with all interactivity wired up.
 *
 * Usage: node scripts/prerender.mjs   (base comes from BASE_PATH env, like the build)
 */
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { writeFile } from 'node:fs/promises';

const require = createRequire(import.meta.url);
const puppeteer = require('puppeteer-core');

const BASE = (process.env.BASE_PATH || '/').replace(/\/?$/, '/');
const PORT = 4173;
const PAGE_URL = `http://localhost:${PORT}${BASE}`;
const distIndex = new URL('../dist/index.html', import.meta.url).pathname;
const viteBin = new URL('../node_modules/vite/bin/vite.js', import.meta.url).pathname;

const server = spawn(
  process.execPath,
  [viteBin, 'preview', '--port', String(PORT), '--strictPort', `--base=${BASE}`],
  {
    cwd: new URL('..', import.meta.url).pathname,
    stdio: 'pipe',
  },
);
server.stderr.on('data', (d) => {
  const s = String(d);
  process.stderr.write(`[server] ${s}`);
  if (s.includes('already in use')) {
    server.kill();
    process.exit(1);
  }
});

async function waitForServer(url, ms) {
  const deadline = Date.now() + ms;
  while (Date.now() < deadline) {
    try {
      const r = await fetch(url);
      if (r.status < 500) return;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error('preview server did not start');
}

try {
  await waitForServer(PAGE_URL, 20000);
  const browser = await puppeteer.launch({
    executablePath: process.env.CHROME_PATH || '/usr/bin/chromium',
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.goto(PAGE_URL, { waitUntil: 'networkidle0' });
  await page.waitForSelector('#explorer', { timeout: 10000 });
  await new Promise((r) => setTimeout(r, 250)); // let first-paint state settle
  const html = await page.evaluate(() => '<!doctype html>\n' + document.documentElement.outerHTML);
  if (!html.includes('id="explorer"') || !html.includes('Last updated:')) {
    throw new Error('prerender sanity check failed: expected content missing');
  }
  await browser.close();
  await writeFile(distIndex, html, 'utf8');
  const kb = (Buffer.byteLength(html) / 1024).toFixed(1);
  console.log(`prerender: dist/index.html written (${kb} kB, content in initial HTML)`);
} finally {
  server.kill();
}
