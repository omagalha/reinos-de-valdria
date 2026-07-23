# Roteiro de migração

## Marco atual — v4.13

- aventura atual preservada;
- fundação Phaser/TypeScript compilando;
- dados e regras iniciais externos;
- save v3 e migração preparados;
- aldeia com três estágios;
- pipeline de assets e direção visual;
- 86 repositórios classificados.

## Etapa 1 — adaptadores entre legado e dados

1. fazer as classes do legado lerem \`characterClasses\`;
2. fazer Guardiões e bestiário lerem os catálogos novos;
3. comparar dano, HP, vínculo, XP e drops em testes;
4. manter o render atual.

Concluída quando não houver duplicação de atributos entre \`public/game\` e \`src/game/data\`.

## Etapa 2 — primeiro mapa Tiled

1. produzir tileset 32 × 32 de Campos de Valdria;
2. desenhar aldeia e arredores em camadas;
3. criar object layers para NPC, spawn, baú, portal e região;
4. validar TMJ/JSON;
5. carregar o mesmo mapa no laboratório Phaser.

Concluída quando o personagem pode circular no mapa com colisão e câmera mobile.

## Etapa 3 — paridade de exploração

Migrar movimento, colisão diagonal, toque para mover, A*, câmera, minimapa e interação. Adicionar Playwright para teclado e viewport de celular.

Concluída quando os fluxos atuais passam tanto no cliente legado quanto no Phaser.

## Etapa 4 — combate e Guardiões

Migrar seleção de alvo, ataque, projéteis, áreas, IA, vínculo, equipe e habilidades. Eventos de combate devem ser independentes da cena.

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
