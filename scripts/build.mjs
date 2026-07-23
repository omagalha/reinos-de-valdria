import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distPath = path.join(projectPath, 'dist');

await rm(distPath, { recursive: true, force: true });
await mkdir(distPath, { recursive: true });
await cp(path.join(projectPath, 'public'), distPath, { recursive: true });

const index = await readFile(path.join(projectPath, 'index.html'), 'utf8');
await writeFile(path.join(distPath, 'index.html'), index, 'utf8');

console.log('Build criada em dist/.');
console.log('HTML, CSS e os 12 arquivos JavaScript foram copiados sem transformação.');
