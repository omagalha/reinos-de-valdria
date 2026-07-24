# Changelog

## 4.21.0 — Bestiário inicial dos Campos

- adiciona Javali Musgoso e Esporo Errante como espécies originais;
- posiciona as novas espécies em `monster_spawns` do TMJ;
- resolve cada spawn pelo `catalogId`, sem pressupor Ratinos;
- aplica HP, dano, XP, drops, visão e movimento por espécie;
- adiciona formas provisórias originais geradas pelo Phaser;
- valida espécies, drops e IDs do mapa automaticamente.

## 4.20.0 — Mana e habilidades de classe

- adiciona mana e regeneração gradual às três classes;
- implementa Golpe, Tiro e Flama com custo, alcance e cooldown dos catálogos;
- adiciona dano ampliado e área de efeito da Flama;
- adiciona comando `Q` e botão mobile de habilidade;
- amplia o HUD com mana e recarga;
- adiciona regras puras e testes de mana e dano de habilidade.

## 4.19.0 — Classes e ataques à distância

- adiciona seleção de Cavaleiro, Arqueiro e Mago no menu Phaser;
- aplica HP, dano, alcance e intervalo próprios de cada classe;
- adiciona projéteis provisórios para Arqueiro e Mago;
- diferencia visualmente as três classes;
- testa seleção segura e alcance de ataques;
- mantém combate e progresso somente na sessão.

## 4.18.0 — Combate básico Phaser

- adiciona Ratinos nos spawns do mapa;
- implementa alvo, HP, dano, alcance e cooldown;
- implementa IA de perseguição e ataque;
- adiciona XP, nível e drops provisórios;
- adiciona HUD e controle mobile de ataque;
- preserva os números do Canvas por testes.

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
