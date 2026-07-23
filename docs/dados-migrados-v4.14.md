# Dados migrados na v4.14

## Fonte canônica

\`src/game/data/catalogs.json\` é a fonte única para:

- 3 classes;
- 6 biomas e seus aliases usados pelo mapa Canvas;
- 6 Guardiões, dos quais 4 já existem no cliente Canvas;
- 11 itens, incluindo os 7 materiais do inventário legado;
- 7 monstros, incluindo as 5 espécies atuais do Canvas.

Os módulos TypeScript validam essas coleções com Zod. O script
\`scripts/generate-legacy-content.mjs\` converte os mesmos dados para os nomes de
campos esperados pelo cliente clássico e gera
\`public/game/00-content-bridge.js\`.

## Paridade preservada

| Catálogo | Campos compartilhados |
|---|---|
| Classes | HP, mana, dano, alcance, custo, cooldown, velocidade de ataque e movimento |
| Guardiões | HP, dano, bioma, cor, habilidade, cooldown e dificuldade de vínculo |
| Monstros | HP, dano, XP, velocidade, visão, alcance, projéteis e drops |
| Itens | ID moderno, ID legado, nome, nome curto e ícone |
| Biomas | ID moderno e aliases visuais do mapa atual |

A fórmula atual de vínculo continua entre 25% com vida cheia e 90% com vida
zerada. O save v2 continua usando seus IDs antigos; nenhuma migração de save foi
feita nesta etapa.

## Como editar

1. altere somente \`src/game/data/catalogs.json\`;
2. execute \`npm run generate:legacy\`;
3. execute \`npm run check\`;
4. não edite \`public/game/00-content-bridge.js\` manualmente.

## Limites desta etapa

- renderização, mapa, combate, interface e save permanecem no cliente Canvas;
- Brumal, Lumenara, Vulto do Lodo e Sentinela de Gelo ainda não foram ligados ao
  gameplay legado;
- o primeiro mapa Tiled de Campos de Valdria é a próxima etapa.
