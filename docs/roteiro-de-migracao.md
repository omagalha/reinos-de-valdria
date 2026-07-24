# Roteiro de migração

## Marco atual — v4.23

- aventura atual preservada;
- fundação Phaser/TypeScript compilando;
- dados e regras iniciais externos;
- save v3 e migração preparados;
- aldeia com três estágios;
- pipeline de assets e direção visual;
- 86 repositórios classificados.
- classes, biomas, Guardiões, itens e monstros em uma fonte canônica;
- adaptador gerado para o cliente Canvas;
- paridade numérica coberta por testes.
- primeiro mapa TMJ de Campos de Valdria carregado no Phaser;
- exploração por teclado, toque e controle virtual com colisão e câmera.
- toque com A*, minimapa e interações provisórias não combativas.
- exploração validada em Chromium desktop e viewport mobile horizontal.
- primeiro combate Phaser contra Ratinos com números dos catálogos.
- seleção das três classes e ataques à distância provisórios.
- mana, habilidades iniciais e primeiro ataque em área.
- três espécies combatíveis nos Campos, todas ligadas ao catálogo pelo TMJ.
- IA por estados, território, respawn e separação entre entidades.
- primeiro encontro, enfraquecimento e vínculo provisório com Folium.

## Etapa 1 — adaptadores entre legado e dados — concluída na v4.14

1. fazer as classes do legado lerem \`characterClasses\`;
2. fazer Guardiões e bestiário lerem os catálogos novos;
3. comparar dano, HP, vínculo, XP e drops em testes;
4. manter o render atual.

Concluída: os atributos ficam em \`src/game/data/catalogs.json\`; \`public/game/00-content-bridge.js\` é gerado e não deve ser editado manualmente. Consulte [dados-migrados-v4.14.md](dados-migrados-v4.14.md).

## Etapa 2 — primeiro mapa Tiled — concluída na v4.15

1. produzir tileset 32 × 32 de Campos de Valdria;
2. desenhar aldeia e arredores em camadas;
3. criar object layers para NPC, spawn, baú, portal e região;
4. validar TMJ/JSON;
5. carregar o mesmo mapa no laboratório Phaser.

Concluída: o mapa possui tiles e object layers validados, e o personagem circula com colisão e câmera mobile. Consulte [mapa-campos-de-valdria-v4.15.md](mapa-campos-de-valdria-v4.15.md).

## Etapa 3 — paridade de exploração — concluída tecnicamente na v4.17

Movimento, colisão diagonal, toque e câmera entraram na v4.15. A*, minimapa e interações provisórias entraram na v4.16. Playwright desktop/mobile e a correção do boot real entraram na v4.17. Interações persistentes serão integradas junto aos sistemas correspondentes, sem bloquear o início da etapa de combate.

Concluída quando os fluxos atuais passam tanto no cliente legado quanto no Phaser.

## Etapa 4 — combate e Guardiões — iniciada na v4.18

Seleção de alvo, HP, IA, XP, classes, habilidades e espécies entraram entre v4.18 e v4.22. O encontro com Folium, enfraquecimento, chance de vínculo e equipe provisória entraram na v4.23. Ainda faltam persistência do vínculo, companheiro ativo, progressão e habilidades de Guardião. Eventos de combate devem continuar migrando para regras independentes da cena.

Concluída quando dano, cooldown, loot, XP e vínculo têm paridade numérica.

## Etapa 5 — aldeias e novos biomas

Ligar coleta aos depósitos, construir estruturas, desbloquear NPCs e contratos. Produzir Pântano Luminoso e Serras Geladas como primeiros biomas novos.

Concluída quando cada estágio muda mapa, serviços, população e missões.

## Etapa 6 — conteúdo, arte e áudio

Transformar a direção visual em tilesets/spritesheets reais, registrar cada licença, trocar áudio procedural gradualmente e manter fallback.

## Etapa 7 — distribuição

Estabilizar PWA offline, controles mobile, atualização de save e desempenho. Só então avaliar Capacitor para Android/iOS.

## Etapa 8 — decisão de multiplayer

Prototipar Colyseus em uma branch isolada. Antes disso, definir autoridade do servidor, contas, anti-cheat, custo de hospedagem e migração de saves. Multiplayer não deve bloquear o lançamento single-player.
