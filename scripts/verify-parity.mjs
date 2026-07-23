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
const generatedBridge = moduleContents[0];
const migratedEntities = moduleContents[2];
const migratedGuardians = moduleContents[3];

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
const modularBody = sliceBetween(index, '<body>', '  <script src="./game/00-content-bridge.js"></script>');

const checks = [
  ['CSS', css, originalCss],
  ['HTML do jogo', modularBody, originalBody],
];

for (const [label, actual, expected] of checks) {
  if (actual !== expected) {
    throw new Error(`${label} mudou durante a modularização (${hash(actual)} != ${hash(expected)}).`);
  }
}

const expectedOriginalHash = 'd65d6c265ae234fb6a549913a6bbe558cf475878ad1b91448331c44f8eb4c06a';
if (hash(originalJavascript) !== expectedOriginalHash) {
  throw new Error('O JavaScript original arquivado foi alterado.');
}
if (!generatedBridge?.includes('Fonte única: src/game/data/catalogs.json')) {
  throw new Error('A ponte de conteúdo gerada não foi carregada como primeiro módulo.');
}
if (/\bconst (CLASSES|BIOMAS|MATERIAIS|BESTIARIO)\b/.test(migratedEntities)) {
  throw new Error('Dados duplicados reapareceram em 02-entities-content.js.');
}
if (/\bconst GUARDIOES\b/.test(migratedGuardians)) {
  throw new Error('Dados duplicados reapareceram em 03-guardians.js.');
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

console.log('Paridade confirmada: HTML/CSS preservados e catálogos legados servidos pela ponte v4.14.');
console.log(`JavaScript original: ${hash(originalJavascript)}`);
console.log(`${manifest.modules.length} arquivos carregados na ordem correta (1 ponte + 12 módulos).`);
