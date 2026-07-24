# Campos de Valdria no Phaser — v4.15

## Área

O primeiro mapa Phaser mede 48 × 32 tiles, ou 1536 × 1024 pixels. Cada tile
possui 32 × 32 pixels. O arquivo carregado pelo jogo é
\`public/assets/maps/campos-de-valdria.tmj\`.

O mapa é gerado por \`scripts/generate-fields-map.mjs\`. Não edite o TMJ gerado
manualmente, pois \`npm run generate\` o recria.

## Layers

Tile layers:

- \`ground\`;
- \`roads\`;
- \`water\`;
- \`obstacles\`;
- \`decoration\`;
- \`collision\`.

Object layers:

- \`player_spawn\`;
- \`npcs\`;
- \`monster_spawns\`;
- \`guardian_spawns\`;
- \`chests\`;
- \`shrines\`;
- \`portals\`;
- \`village_slots\`;
- \`biome_zones\`.

Os objetos usam propriedades como \`catalogId\`, \`itemId\`, \`biomeId\` e
\`stageId\`. O comando \`npm run verify:map\` rejeita referências inexistentes.

## Exploração

- WASD e setas possuem a mesma velocidade;
- diagonais são normalizadas para não correr mais rápido;
- colisão usa o layer dedicado e impede atravessar água, árvores, rochas e bordas;
- duas quinas bloqueadas impedem passagem diagonal;
- toque define um destino em linha reta;
- controle virtual provisório ocupa o canto inferior esquerdo;
- a câmera acompanha o jogador dentro dos limites do mapa.

## Assets

\`campos-provisorio.svg\` contém oito tiles vetoriais originais: grama, estrada,
água, árvore, flores, marcador de colisão, praça e pedra. É um tileset provisório;
deve ser substituído por pixel art aprovada antes da produção.

## Limitações

- toque para mover ainda não usa A* e para diante de obstáculos;
- spawns são marcadores visuais, sem combate, IA ou vínculo;
- baú, santuário e portal ainda não possuem interação;
- a aldeia possui apenas slots no mapa; sua progressão ainda não altera o TMJ;
- ainda não há teste automatizado em navegador real ou dispositivo físico.
