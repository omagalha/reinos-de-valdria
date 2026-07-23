import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicPath = path.join(projectPath, 'public');
const manifestPath = path.join(publicPath, 'assets', 'manifest.json');
const licensesPath = path.join(projectPath, 'ASSET_LICENSES.md');

const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const licenses = await readFile(licensesPath, 'utf8');

if (manifest.tileSize !== 32 || !Array.isArray(manifest.entries)) {
  throw new Error('Manifesto de assets inválido.');
}

const ids = new Set();
for (const entry of manifest.entries) {
  if (ids.has(entry.id)) throw new Error('Asset repetido no manifesto: ' + entry.id);
  ids.add(entry.id);
  await access(path.join(publicPath, entry.path));
  if (!licenses.includes(entry.id)) {
    throw new Error('Asset sem registro de licença: ' + entry.id);
  }
}

console.log(
  'Assets verificados: ' +
    String(manifest.entries.length) +
    ' arquivos existentes, IDs únicos e licenças registradas.',
);
