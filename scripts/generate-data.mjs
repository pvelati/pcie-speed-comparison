/** Generates public/data.json from the typed data model at build time.
 * Uses esbuild (already a Vite dependency) to bundle the TS entry. */
import { dirname, join } from 'node:path';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outfile = join(root, 'node_modules', '.cache', 'ba-data.cjs');
await build({
  entryPoints: [join(root, 'scripts', 'data-entry.ts')],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  outfile,
  logLevel: 'silent',
});
const { data } = await import(pathToFileURL(outfile));
mkdirSync(join(root, 'public'), { recursive: true });
writeFileSync(join(root, 'public', 'data.json'), JSON.stringify(data, null, 2) + '\n');
console.log(
  `data.json: ${data.pcie.length} PCIe generations, ${data.interfaces.length} interfaces`,
);
