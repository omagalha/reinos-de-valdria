import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(
  await readFile(path.join(projectPath, 'modularization-manifest.json'), 'utf8'),
);

const original = await readFile(path.join(projectPath, manifest.source), 'utf8');
const index = await readFile(path.join(projectPath, 'index.html'), 'utf8');
const css = await readFile(path.join(projectPath, manifest.css), 'utf8');
const moduleContents = await Promise.all(
  manifest.modules.map(({ file }) => readFile(path.join(projectPath, file), 'utf8')),
);

function sliceBetween(source, openToken, closeToken, from = 0) {
  const open = source.indexOf(openToken, from);
  const close = source.indexOf(closeToken, open + openToken.length);
  if (open < 0 || close < 0) throw new Error(`Trecho não encontrado: ${openToken} ... ${closeToken}`);
  return source.slice(open + openToken.length, close).replace(/^\r?\n/, '');
}

function hash(value) {
  return createHash('sha256').update(value).digest('hex');
}

const originalCss = sliceBetween(original, '<style>', '</style>');
const originalJavascript = sliceBetween(original, '<script>', '</script>');
const originalBody = sliceBetween(original, '<body>', '<script>');
const modularBody = sliceBetween(index, '<body>', '  <script src="./game/01-world-map.js"></script>');
const combinedJavascript = moduleContents.join('');

const checks = [
  ['CSS', css, originalCss],
  ['HTML do jogo', modularBody, originalBody],
  ['JavaScript concatenado', combinedJavascript, originalJavascript],
];

for (const [label, actual, expected] of checks) {
  if (actual !== expected) {
    throw new Error(`${label} mudou durante a modularização (${hash(actual)} != ${hash(expected)}).`);
  }
}

let previousPosition = -1;
for (const { file } of manifest.modules) {
  const publicPath = file.replace(/^public\//, './');
  const tag = `<script src="${publicPath}"></script>`;
  const position = index.indexOf(tag);
  if (position < 0 || position <= previousPosition) {
    throw new Error(`Ordem de carregamento inválida para ${file}.`);
  }
  previousPosition = position;
}

console.log('Paridade confirmada: HTML, CSS e JavaScript preservados byte a byte.');
console.log(`JavaScript original: ${hash(originalJavascript)}`);
console.log(`${manifest.modules.length} arquivos carregados na ordem correta.`);
