# Testes de exploração — v4.17

## Objetivo

Vitest e TypeScript não executavam o Phaser em um navegador real. A v4.17
adiciona Playwright para validar o cliente servido pelo Vite.

Os primeiros testes revelaram um ciclo de imports entre \`config.ts\` e as cenas
que interrompia o boot antes da criação do Canvas. As dimensões foram movidas
para \`src/game/dimensions.ts\`, eliminando o ciclo.

## Cenários

- abertura de \`modern.html\` sem erros de página;
- entrada em \`WorldScene\`;
- câmera e minimapa disponíveis;
- movimento diagonal por teclado alterando os dois eixos;
- clique/toque calculando um caminho A* e movimentando o jogador;
- Canvas contido em viewport mobile horizontal.

## Comandos

Na primeira vez:

\`\`\`powershell
npx playwright install chromium
\`\`\`

Depois:

\`\`\`powershell
npm run test:e2e
npm run check:full
\`\`\`

O Chromium baixado pelo Playwright fica no cache local da ferramenta e não é
incluído no repositório nem na build do jogo.
