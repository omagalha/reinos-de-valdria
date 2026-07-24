# Changelog

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
