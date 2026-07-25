# Changelog

## 4.30.0 — Primeira construção

- transforma o `village_slots` em ponto interativo de obra;
- adiciona a planta original Abrigo de Madeira;
- exige 9 madeiras e 4 fibras do depósito;
- informa exatamente os recursos ausentes;
- desconta custos, aumenta a população e persiste a estrutura;
- renderiza um abrigo provisório no mapa após a construção;
- restaura visualmente a obra a partir do save v3.

## 4.29.0 — Coleta e depósito da aldeia

- adiciona três pontos de recurso originais ao TMJ dos Campos;
- coleta Fibra Verde e Madeira Jovem com regeneração temporizada;
- adiciona Madeira Jovem ao catálogo canônico;
- converte materiais carregados em recursos do depósito da aldeia;
- persiste inventário e recursos depositados no save v3;
- mostra o estoque da aldeia no HUD;
- valida IDs, quantidades e regeneração dos recursos no TMJ.

## 4.28.0 — Gerenciamento de equipe

- adiciona painel de equipe dentro do Phaser;
- abre pelo teclado com `T` ou pelo botão mobile `EQUIPE`;
- lista nome, elemento, nível, XP, HP e estado de até seis membros;
- permite escolher diretamente o Guardião ativo;
- bloqueia a ativação de membros desmaiados;
- pausa a exploração enquanto o painel está aberto;
- adiciona diagnóstico e teste Playwright do fluxo.

## 4.27.0 — Equipe de Guardiões

- persiste todos os Guardiões da equipe no save v3;
- restaura a espécie definida por `activeGuardianId`;
- permite trocar o companheiro com `R` ou controle mobile;
- evita selecionar membros desmaiados quando há outro disponível;
- preserva HP, nível, XP e tempo de recuperação por instância;
- reconhece espécies migradas usando o catálogo canônico;
- mantém compatibilidade com o campo `guardian` das integrações anteriores.

## 4.26.0 — Dano e recuperação do Guardião

- permite que monstros escolham Folium como alvo quando ele estiver mais perto;
- aplica dano do catálogo ao jogador ou companheiro escolhido;
- faz Folium desmaiar ao chegar a 0 HP;
- interrompe movimento, ataque e cura durante o desmaio;
- desperta Folium após 20 segundos com metade do HP;
- persiste desmaio e tempo restante no save v3;
- mantém compatibilidade automática com saves v3 anteriores.

## 4.25.0 — Save persistente Phaser

- conecta Boot e World ao `SaveRepository` Dexie existente;
- carrega save v3 ou importa o Canvas v2 sem apagá-lo;
- restaura classe, posição, HP, mana, nível, XP, materiais e núcleos;
- restaura vínculo, nível, XP e HP de Folium;
- adiciona autosave a cada cinco segundos, ao sair e após o vínculo;
- preserva missões, aldeia e flags ainda não controladas pelo laboratório;
- adiciona teste E2E de recarregamento real pelo IndexedDB.

## 4.24.0 — Folium companheiro

- mantém Folium visível e seguindo o jogador após o vínculo;
- faz o companheiro perseguir e atacar o monstro selecionado;
- preserva dano, intervalo e metade do XP do comportamento Canvas;
- adiciona nível, experiência e crescimento de HP do Guardião;
- implementa uso automático de Raiz Vital durante o combate;
- amplia o HUD e o estado de diagnóstico do companheiro;
- mantém a equipe somente na sessão.

## 4.23.0 — Primeiro vínculo Phaser

- instancia Folium a partir de `guardian_spawns` e `catalogs.json`;
- adiciona seleção e enfraquecimento sem derrotar o Guardião;
- preserva a fórmula de chance de vínculo do Canvas;
- adiciona tentativa por `V` e botão mobile `VÍNCULO`;
- adiciona três Núcleos de Essência provisórios por sessão;
- registra Folium em uma equipe provisória após o sucesso;
- mantém vínculo e equipe fora do save nesta primeira integração.

## 4.22.0 — IA, território e respawn

- adiciona estados de IA `idle`, `chasing`, `attacking`, `returning` e `defeated`;
- diferencia detecção territorial e por emboscada;
- faz monstros abandonarem perseguições longas e retornarem ao spawn;
- adiciona respawn seguro após oito segundos;
- impede sobreposição entre jogador e monstros e entre monstros;
- aplica conceitos dos repositórios estudados sem adicionar nova dependência.

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
