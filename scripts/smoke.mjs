/**
 * Headless browser smoke test.
 * Serves the production build with `vite preview`, then drives the real page
 * with Chromium: clicks every explorer control, checks computed figures,
 * lane diagram counts, tabs, the calculator, mobile overflow and the 404.
 *
 * Usage: node scripts/smoke.mjs [base]   (base defaults to "/")
 */
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const puppeteer = require('puppeteer-core');

const BASE = (process.argv[2] ?? '/').replace(/\/?$/, '/');
const PORT = 4173;
const PAGE_URL = `http://localhost:${PORT}${BASE}`;

let passed = 0;
function check(name, ok, extra = '') {
  if (ok) {
    passed += 1;
    console.log(`  ok  ${name}`);
  } else {
    console.error(`FAIL  ${name} ${extra}`);
    process.exitCode = 1;
  }
}

// -- start preview server ----------------------------------------------------
const viteBin = new URL('../node_modules/vite/bin/vite.js', import.meta.url).pathname;
const server = spawn(
  process.execPath,
  [viteBin, 'preview', '--port', String(PORT), '--strictPort', `--base=${BASE}`],
  {
    cwd: new URL('..', import.meta.url).pathname,
    stdio: 'pipe',
    env: { ...process.env, BASE_PATH: BASE },
  },
);
server.stderr.on('data', (d) => {
  const s = String(d);
  process.stderr.write(`[server] ${s}`);
  if (s.includes('already in use')) {
    server.kill();
    console.error('Port 4173 is busy — kill the stray preview server and retry.');
    process.exit(1);
  }
});

let serverReady = false;
server.stdout.on('data', (d) => {
  if (String(d).includes('localhost')) serverReady = true;
});

const deadline = Date.now() + 15000;
while (!serverReady && Date.now() < deadline) {
  await new Promise((r) => setTimeout(r, 150));
}
if (!serverReady) {
  console.error('preview server did not start');
  server.kill();
  process.exit(1);
}

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/chromium',
  headless: true,
  args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
});

try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => {
    // Resource-load 404s (e.g. a browser's automatic /favicon.ico probe) are
    // environmental; real JS failures surface as pageerror or other console errors.
    if (m.type() === 'error' && !m.text().startsWith('Failed to load resource')) {
      errors.push(m.text());
    }
  });

  // -- load -------------------------------------------------------------------
  const resp = await page.goto(PAGE_URL, { waitUntil: 'networkidle0' });
  check('page loads 200', resp.status() === 200, `(got ${resp.status()})`);
  const title = await page.title();
  check('title is the page title', title === 'PCIe Speed Explorer — Understand Every Lane', title);
  check('no JS errors on load', errors.length === 0, JSON.stringify(errors));

  for (const id of ['explorer', 'lanes', 'compare', 'examples', 'glossary', 'sources']) {
    check(`section #${id} exists`, Boolean(await page.$(`#${id}`)));
  }

  const clickRadio = (name, value) =>
    page.click(`input[type="radio"][name="${name}"][value="${value}"]`);

  // -- explorer: defaults (A: Gen 4 ×16) ----------------------------------------
  check(
    'default A one-way shows 31.51 GB/s',
    (await page.$eval(
      '#explorer .link-panel[data-link="a"] .metric-hero .metric-value .num',
      (n) => n.textContent,
    )) === '31.51',
  );
  check(
    'default A bidirectional shows 63.02 GB/s',
    (await page.$eval(
      '#explorer .link-panel[data-link="a"] .metric-bidir .metric-value .num',
      (n) => n.textContent,
    )) === '63.02',
  );

  // -- explorer: click Gen 5, ×4 on A -------------------------------------------
  await clickRadio('gen-a', '5');
  await clickRadio('lanes-a', '4');
  await page.waitForFunction(
    () =>
      document.querySelector('#explorer .link-panel[data-link="a"] .metric-hero .metric-value .num')
        ?.textContent === '15.75',
  );
  check('A Gen 5 ×4 one-way updates to 15.75 GB/s immediately', true);
  check(
    'A Gen 5 ×4 one-way in Gbps is 126 Gbps',
    (
      await page.$eval(
        '#explorer .link-panel[data-link="a"] .metric-hero .metric-sub',
        (n) => n.textContent,
      )
    ).includes('126 Gbps'),
  );

  // -- comparison strip: A (15.75) vs B (Gen 3 ×4 = 3.938) = 4× ------------------
  const strip = await page.$eval('.compare-strip', (n) => n.textContent);
  check('compare strip shows A is 4× B', strip.includes('A is 4× B'), strip);
  check(
    'compare strip keeps one-way basis visible',
    strip.includes('one-way') && strip.includes('Basis'),
  );

  // -- lane visualizer follows Link A -------------------------------------------
  const laneRows = () => page.$$eval('.lane-row', (rows) => rows.length);
  check('lane diagram shows 4 lanes for A ×4', (await laneRows()) === 4, `got ${await laneRows()}`);
  await clickRadio('lanes-a', '32');
  await page.waitForFunction(() => document.querySelectorAll('.lane-row').length === 32);
  check('lane diagram shows 32 lanes for A ×32', true);
  check(
    'lane svg has updated accessible label',
    (await page.$eval('.lane-svg', (s) => s.getAttribute('aria-label') ?? '')).includes(
      '32 parallel',
    ),
  );
  await clickRadio('lanes-a', '16');
  await page.waitForFunction(() => document.querySelectorAll('.lane-row').length === 16);
  check('lane diagram shows 16 lanes for A ×16', true);

  // -- explorer: Gen 7 ×16 = 256 GB/s one-way / 512 bidirectional ----------------
  await clickRadio('gen-a', '7');
  await clickRadio('lanes-a', '16');
  await page.waitForFunction(
    () =>
      document.querySelector('#explorer .link-panel[data-link="a"] .metric-hero .metric-value .num')
        ?.textContent === '256',
  );
  check('A Gen 7 ×16 one-way = 256 GB/s', true);
  check(
    'A Gen 7 ×16 bidirectional = 512 GB/s',
    (await page.$eval(
      '#explorer .link-panel[data-link="a"] .metric-bidir .metric-value .num',
      (n) => n.textContent,
    )) === '512',
  );

  // -- hero figure ----------------------------------------------------------------
  const heroText = await page.$eval('.hero-figure', (n) => n.textContent);
  check(
    'hero shows 512 GB/s with one-way/bidirectional distinction',
    heroText.includes('512') &&
      heroText.includes('256 GB/s') &&
      heroText.includes('not a one-way rate'),
  );

  // -- comparison tabs --------------------------------------------------------------
  const clickTab = (label) =>
    page.evaluate((l) => {
      [...document.querySelectorAll('[role="tab"]')]
        .find((t) => t.textContent.trim() === l)
        ?.click();
    }, label);

  const rowCount = () => page.$$eval('.chart-row', (r) => r.length);
  const tableCount = () => page.$$eval('.data-table tbody tr', (r) => r.length);

  check(
    'default tab "All" chart has 38 rows',
    (await rowCount()) === 38,
    `got ${await rowCount()}`,
  );
  check('"All" table has 38 rows', (await tableCount()) === 38, `got ${await tableCount()}`);
  check(
    'table sources are real links',
    await page.$$eval('.src-link', (a) => a.every((x) => x.href.startsWith('http'))),
  );

  await clickTab('USB');
  check('USB tab: 8 chart rows', (await rowCount()) === 8, `got ${await rowCount()}`);
  check('USB tab: table has 8 rows', (await tableCount()) === 8);
  check('USB family note present', (await page.$('.note-usb')) !== null);

  await clickTab('Wi-Fi');
  check('Wi-Fi tab: 6 chart rows', (await rowCount()) === 6, `got ${await rowCount()}`);
  const wifiText = await page.$eval('.tab-panel', (n) => n.textContent);
  check('Wi-Fi 2×2 client example present (≈ 5.8 Gbps)', wifiText.includes('5.8 Gbps'));
  check('Wi-Fi shared-medium caveat present', wifiText.includes('shared'));

  await clickTab('Ethernet');
  check(
    'Ethernet tab: 13 ratified rows (no 1.6T)',
    (await rowCount()) === 13,
    `got ${await rowCount()}`,
  );
  const ethText = await page.$eval('.tab-panel', (n) => n.textContent);
  check(
    '1.6 Tb/s appears only in the roadmap strip',
    ethText.includes('roadmap') && ethText.includes('1.6 Tbps'),
  );

  await clickTab('PCIe');
  check('PCIe tab: 7 rows (Gen 1–7 ×16)', (await rowCount()) === 7, `got ${await rowCount()}`);

  check('log scale note present', (await page.$('.scale-note')) !== null);
  check('chart has decade gridlines', (await page.$$eval('.chart-tickline', (t) => t.length)) > 20);

  // -- examples -----------------------------------------------------------------------
  const examplesText = await page.$eval('#examples', (n) => n.textContent);
  check('NVMe Gen 4 ×4 example computed (7.877 GB/s)', examplesText.includes('7.877'));
  check(
    'GPU example computed (31.51 and 63.02 GB/s)',
    examplesText.includes('31.51') && examplesText.includes('63.02'),
  );
  check(
    'scale check includes 10GbE and USB4 40',
    examplesText.includes('10GbE') && examplesText.includes('USB4 (40 Gbps)'),
  );

  // transfer calculator: default Gen 4 ×4, 10 GB → 1.3 s
  check(
    'calculator default 10 GB at Gen 4 ×4 ≈ 1.3 s',
    (await page.$eval('#transfer-time', (n) => n.textContent)) === '1.3 s',
    `got ${await page.$eval('#transfer-time', (n) => n.textContent)}`,
  );
  await page.evaluate(() => {
    const r = [...document.querySelectorAll('input[name="transfer-config"]')].find(
      (x) => x.value === 'gen5x16',
    );
    r.checked = true;
    r.dispatchEvent(new Event('change', { bubbles: true }));
  });
  check(
    'calculator updates for Gen 5 ×16 (10 GB → 0.2 s)',
    (await page.$eval('#transfer-time', (n) => n.textContent)) === '0.2 s',
    `got ${await page.$eval('#transfer-time', (n) => n.textContent)}`,
  );
  check('idealized lower-bound label present', examplesText.includes('idealized lower bound'));

  // -- glossary & sources ------------------------------------------------------------------
  const terms = await page.$$eval('.term-list summary', (s) => s.length);
  check('glossary has 9 terms', terms === 9, `got ${terms}`);
  const sourcesText = await page.$eval('#sources', (n) => n.textContent);
  check('data-checked date visible', sourcesText.includes('Data checked: 24 November 2026'));
  check(
    'methodology formulas present',
    sourcesText.includes('128 ÷ 130') && sourcesText.includes('8 ÷ 10'),
  );
  const srcLinks = await page.$$eval(
    '#sources a',
    (a) => a.filter((x) => x.href.startsWith('http')).length,
  );
  check('source list has ≥ 20 links', srcLinks >= 20, `got ${srcLinks}`);

  // -- mobile 320px ------------------------------------------------------------------------
  await page.setViewport({ width: 320, height: 700 });
  await new Promise((r) => setTimeout(r, 150));
  const overflow = await page.evaluate(() => ({
    sw: document.documentElement.scrollWidth,
    cw: document.documentElement.clientWidth,
  }));
  check(
    'no horizontal overflow at 320px',
    overflow.sw <= overflow.cw + 1,
    JSON.stringify(overflow),
  );
  const bodyFont = await page.$eval('body', (b) => getComputedStyle(b).fontSize);
  check('body font ≥ 14px at 320px', parseFloat(bodyFont) >= 14, bodyFont);

  // -- 404 page --------------------------------------------------------------------------------
  const r404 = await page.goto(`${PAGE_URL}404.html`, { waitUntil: 'networkidle0' });
  check('404 page serves', r404.status() === 200);
  check(
    '404 page links back home',
    (await page.$eval('#home', (a) => a.getAttribute('href'))).endsWith('/'),
  );

  check('no JS errors at end', errors.length === 0, JSON.stringify(errors));
} finally {
  await browser.close();
  server.kill();
}

console.log(`\n${passed} checks passed${process.exitCode ? ' (with failures)' : ''}.`);
