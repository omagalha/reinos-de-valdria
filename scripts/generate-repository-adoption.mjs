import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = path.join(projectPath, 'docs', 'guia-original-86-repositorios.md');
const outputPath = path.join(projectPath, 'docs', 'matriz-de-adocao-dos-86-repositorios.md');
const source = await readFile(sourcePath, 'utf8');

const rows = source
  .split(/\r?\n/)
  .map((line) =>
    line.match(
      /^\|\s*(\d+)\s*\|\s*\[([^\]]+)\]\((https:\/\/github\.com\/[^)]+)\)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|$/,
    ),
  )
  .filter(Boolean)
  .map((match) => ({
    id: Number(match[1]),
    name: match[2],
    url: match[3],
    priority: match[4].replaceAll('**', ''),
    contribution: match[5],
  }));

if (rows.length !== 86) {
  throw new Error('Esperados 86 repositórios; encontrados ' + String(rows.length) + '.');
}

const decisions = new Map([
  [1, ['Dependência v4.13', 'Phaser 3.90 instalado; usado no laboratório modern.html sem substituir o jogo legado.']],
  [2, ['Estrutura aplicada', 'A divisão boot/menu/world/UI e o Vite multi-página seguem o esqueleto recomendado.']],
  [3, ['Consulta oficial', 'Referência diária para input, câmera, tilemap, animações e otimização Phaser.']],
  [4, ['Ferramenta externa planejada', 'A especificação de tiles e mapas já está pronta; Tiled entra quando o primeiro tileset 32 × 32 for aprovado.']],
  [21, ['Padrão aplicado sem dependência', 'A máquina de estados mínima está em src/game/systems/game-state.ts.']],
  [22, ['Dependência v4.13', 'Zod valida catálogos, manifesto e o novo formato de save.']],
  [23, ['Dependência v4.13', 'Vitest cobre dados, regras, progressão, migração e o smoke test do jogo atual.']],
  [24, ['Próxima camada de testes', 'Playwright será adicionado quando a migração começar a substituir telas do jogo principal.']],
  [51, ['Modelo aplicado', 'Separação de espécie, instância, vínculo, elemento e habilidades orientou guardians.ts.']],
  [55, ['Modelo aplicado', 'Relacionamentos entre espécie, bioma e habilidade foram recriados com conteúdo original.']],
  [61, ['Modelo aplicado', 'Necessidades, estruturas e população inspiraram os três estágios de aldeia.']],
  [62, ['Modelo aplicado', 'Desbloqueios claros por estágio entraram no catálogo de aldeias.']],
  [63, ['Modelo aplicado', 'Custos encadeados e metas de entrega entraram no sistema de evolução.']],
  [64, ['Modelo aplicado', 'Biomas, monstros, itens, Guardiões e quests agora vivem em catálogos externos ao HTML.']],
  [73, ['Dependência v4.13', 'Dexie está encapsulado no SaveRepository e recebe saves migrados do localStorage v2.']],
  [76, ['Dependência v4.13', 'Vite serve o jogo atual e compila o laboratório TypeScript em uma única build.']],
  [77, ['Dependência v4.13', 'PWA configurada com manifest, cache da build e ícone original provisório.']],
  [79, ['Dependência v4.13', 'Howler está encapsulado por canais de música e efeitos em AudioService.']],
]);

function decisionFor(row) {
  const explicit = decisions.get(row.id);
  if (explicit) return explicit;
  if (row.priority.startsWith('B')) {
    return ['Depois da paridade', 'Mantido como candidato; só entra quando houver uma necessidade medida e teste de compatibilidade.'];
  }
  if (row.priority.startsWith('C')) {
    return ['Alternativa ou futuro', 'Não misturar agora com a stack principal; preservar como opção para uma decisão arquitetural futura.'];
  }
  if (row.priority.startsWith('Estudo')) {
    return ['Estudo com cautela', 'Usar conceitos e arquitetura, sem copiar conteúdo, assets ou código incompatível com a licença do Valdria.'];
  }
  return ['Referência ativa', 'Usar como documentação e padrão de implementação, sem adicionar dependência desnecessária.'];
}

const lines = [
  '# Matriz de adoção dos 86 repositórios',
  '',
  'Esta matriz confirma o destino de todos os 86 links enviados. Eles não foram instalados em massa: engines concorrentes, projetos arquivados, servidores e referências com propriedade intelectual não devem virar dependências do mesmo jogo.',
  '',
  'Legenda de decisão:',
  '',
  '- **Dependência v4.13:** pacote realmente usado nesta entrega;',
  '- **Estrutura/Modelo aplicado:** ideia incorporada em código ou organização próprios;',
  '- **Depois da paridade:** candidato para uma fase posterior, com teste antes da adoção;',
  '- **Alternativa ou futuro:** escolha incompatível ou desnecessária para a stack atual;',
  '- **Estudo com cautela:** somente referência, respeitando licença e propriedade intelectual.',
  '',
  '| # | Repositório | Prioridade do guia | Decisão na v4.13 | O que entra no Valdria |',
  '|---:|---|---|---|---|',
];

for (const row of rows) {
  const [status, note] = decisionFor(row);
  lines.push(
    '| ' +
      String(row.id) +
      ' | [' +
      row.name +
      '](' +
      row.url +
      ') | ' +
      row.priority +
      ' | **' +
      status +
      '** — ' +
      note +
      ' | ' +
      row.contribution +
      ' |',
  );
}

lines.push(
  '',
  '## Contagem',
  '',
  '- 86 linhas numeradas;',
  '- 86 links GitHub únicos;',
  '- nenhuma engine concorrente instalada junto com Phaser;',
  '- referências Pokémon/Tibia limitadas a padrões abstratos e sem conteúdo protegido.',
  '',
);

await writeFile(outputPath, lines.join('\n'), 'utf8');
console.log('Matriz gerada com 86 repositórios em docs/matriz-de-adocao-dos-86-repositorios.md.');
