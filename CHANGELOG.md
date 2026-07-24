# Changelog

## 4.17.0 — Exploração validada em navegador

- adiciona Playwright e Chromium para testes E2E;
- valida boot, câmera, minimapa, teclado, diagonal, toque e viewport mobile;
- corrige ciclo de imports que impedia o Phaser de iniciar no navegador real;
- separa dimensões do jogo em módulo neutro;
- adiciona \`test:e2e\` e \`check:full\`;
- mantém o diagnóstico fora da build de produção.

## 4.16.0 — Paridade inicial de exploração

- adiciona pathfinding A* em oito direções para toque;
- impede corte diagonal entre quinas bloqueadas;
- adiciona minimapa e indicador da câmera;
- adiciona interação por teclado e botão mobile;
- adiciona respostas provisórias para NPC, baú, santuário e portal;
- adiciona testes de A* e proximidade;
- mantém combate, vínculo e save fora desta etapa.

## 4.15.0 — Primeiro mapa Tiled e exploração Phaser

- adiciona Campos de Valdria em TMJ com 6 tile layers e 9 object layers;
- adiciona tileset vetorial original provisório de 32 × 32;
- carrega e renderiza o mapa no \`WorldScene\`;
- implementa teclado, diagonal, colisão, bloqueio de quinas, câmera, toque e controle virtual;
- cataloga NPCs e valida todos os IDs usados pelo mapa;
- registra mapa e tileset no manifesto e nas licenças;
- adiciona validador automático e 6 testes de exploração;
- preserva integralmente o jogo Canvas e o save v2.

## 4.14.0 — Ponte entre legado e fundação

- centraliza classes, biomas, Guardiões, itens e monstros em um catálogo JSON;
- gera uma camada de compatibilidade para o cliente Canvas;
- remove atributos duplicados dos módulos legados de entidades e Guardiões;
- preserva números, controles, renderização e save v2 atuais;
- amplia os testes de paridade para a ponte de dados;
- prepara a arquitetura para o primeiro mapa Tiled de Campos de Valdria.

## 4.13.0 — Fundação

- adiciona o laboratório Phaser + TypeScript sem substituir o jogo Canvas;
- cria catálogos Zod, save v3, Dexie, Howler, PWA e progressão de aldeia;
- documenta o pipeline de assets e os 86 repositórios avaliados.
