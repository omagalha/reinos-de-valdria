import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const [, , sourceArgument, projectArgument = '.'] = process.argv;

if (!sourceArgument) {
  throw new Error('Uso: node scripts/split-legacy.mjs <arquivo-html> [pasta-do-projeto]');
}

const sourcePath = path.resolve(sourceArgument);
const projectPath = path.resolve(projectArgument);
const html = await readFile(sourcePath, 'utf8');

const styleOpen = html.indexOf('<style>');
const styleClose = html.indexOf('</style>', styleOpen);
const bodyOpen = html.indexOf('<body>', styleClose);
const scriptOpen = html.indexOf('<script>', bodyOpen);
const scriptClose = html.lastIndexOf('</script>');

if ([styleOpen, styleClose, bodyOpen, scriptOpen, scriptClose].some(index => index < 0)) {
  throw new Error('O HTML de origem não possui a estrutura esperada de style/body/script.');
}

const css = html.slice(styleOpen + '<style>'.length, styleClose).replace(/^\r?\n/, '');
const body = html.slice(bodyOpen + '<body>'.length, scriptOpen).replace(/^\r?\n/, '');
const javascript = html.slice(scriptOpen + '<script>'.length, scriptClose).replace(/^\r?\n/, '');

const moduleDefinitions = [
  { file: '01-world-map.js', marker: null },
  { file: '02-entities-content.js', marker: '// ---------- 2. ENTIDADES ----------' },
  { file: '03-guardians.js', marker: '// ---------- 3. GUARDIÕES ----------' },
  { file: '04-equipment.js', marker: '// ---------- EQUIPAMENTOS v4.6 ----------' },
  { file: '05-quests-contracts.js', marker: '// ---------- 4. MISSÕES E HISTÓRIA ----------' },
  { file: '06-gameplay-ai.js', marker: '// ---------- 5. LÓGICA ----------' },
  { file: '07-interactions-shop.js', marker: '// ---------- LOJA DO ANCIÃO ----------' },
  { file: '08-effects-audio.js', marker: '// ---------- 6. PROJÉTEIS, TEXTOS FLUTUANTES E MOVIMENTO SUAVE ----------' },
  { file: '09-rendering.js', marker: '// ---------- 8. RENDERIZAÇÃO ----------' },
  { file: '10-input-ui.js', marker: '// ---------- 9. ENTRADA E UI ----------' },
  { file: '11-save-load.js', marker: '// ---------- SAVE/LOAD AUTOMÁTICO ----------' },
  { file: '12-main-loop.js', marker: '// ---------- LOOP PRINCIPAL ----------' },
];

const starts = moduleDefinitions.map((definition, index) => {
  if (index === 0) return 0;
  const markerIndex = javascript.indexOf(definition.marker);
  if (markerIndex < 0) throw new Error(`Marcador não encontrado: ${definition.marker}`);
  return markerIndex;
});

const publicPath = path.join(projectPath, 'public');
const gamePath = path.join(publicPath, 'game');
const stylesPath = path.join(publicPath, 'styles');
const legacyPath = path.join(projectPath, 'legacy');

await Promise.all([
  mkdir(gamePath, { recursive: true }),
  mkdir(stylesPath, { recursive: true }),
  mkdir(legacyPath, { recursive: true }),
]);

const modules = moduleDefinitions.map((definition, index) => {
  const end = starts[index + 1] ?? javascript.length;
  return {
    ...definition,
    content: javascript.slice(starts[index], end),
  };
});

await Promise.all(modules.map(({ file, content }) =>
  writeFile(path.join(gamePath, file), content, 'utf8')
));

await writeFile(path.join(stylesPath, 'game.css'), css, 'utf8');

const head = html.slice(0, styleOpen);
const betweenStyleAndBody = html.slice(styleClose + '</style>'.length, bodyOpen);
const scriptTags = modules
  .map(({ file }) => `  <script src="./game/${file}"></script>`)
  .join('\n');

const modularHtml = `${head}<link rel="stylesheet" href="./styles/game.css">${betweenStyleAndBody}<body>\n${body}${scriptTags}\n</body>\n</html>\n`;

await writeFile(path.join(projectPath, 'index.html'), modularHtml, 'utf8');
await copyFile(sourcePath, path.join(legacyPath, 'reinos_de_valdria_v411_original.html'));

const manifest = {
  source: 'legacy/reinos_de_valdria_v411_original.html',
  css: 'public/styles/game.css',
  modules: modules.map(({ file, content }) => ({
    file: `public/game/${file}`,
    bytes: Buffer.byteLength(content, 'utf8'),
  })),
};

await writeFile(
  path.join(projectPath, 'modularization-manifest.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
  'utf8',
);

console.log(`Valdria modularizado em ${projectPath}`);
console.log(`${modules.length} arquivos JavaScript criados sem alterar a ordem do código.`);
