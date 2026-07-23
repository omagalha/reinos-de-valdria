# Reinos de Valdria — 86 repositórios para evoluir o jogo

> Guia técnico criado em 19 de julho de 2026 a partir da análise de `reinos_de_valdria_v411_movimento_fluido(1).html`.
>
> Objetivo: transformar o protótipo HTML/Canvas em um jogo 2D modular, mobile-first e expansível, misturando exploração no estilo **TibiaME**, criaturas e equipes inspiradas no gênero **monster-taming**, progressão de aldeias, crafting e biomas próprios.

## Recomendação objetiva

Para o estado atual do projeto, a rota com melhor relação entre qualidade, velocidade e reaproveitamento é:

**Phaser + TypeScript + Vite + Tiled + Vitest + Dexie + Capacitor.**

Isso permite reaproveitar quase toda a lógica que já existe em JavaScript — classes, dano, criaturas, loot, missões, contratos, pathfinding e save — enquanto o Phaser assume renderização, câmeras, animações, tilemaps, input e organização em cenas.

Não recomendo recomeçar tudo no Godot agora. Godot é uma ótima alternativa, mas exigiria uma reescrita muito maior. Primeiro vale modularizar e alcançar paridade com a versão atual. Depois, com o jogo mais definido, você poderá decidir com muito mais segurança se continua na web, empacota como aplicativo ou migra de engine.

## O que já existe na v4.11

O arquivo analisado possui aproximadamente **3.756 linhas e 122 KB**, com tudo reunido em HTML, CSS e JavaScript. Já estão implementados:

- Canvas 2D pixelado em resolução interna de 640 × 352;
- mapa de 44 × 40 tiles e geração procedural simples;
- movimento em oito direções, joystick mobile, toque para mover e A*;
- colisão e proteção contra corte de quinas na diagonal;
- Cavaleiro, Arqueiro e Mago, cada um com atributos e especial;
- campos, estrada, lago, caverna, trono e Praia Solar;
- bestiário, chefes, spawns, perseguição, projéteis e áreas de perigo;
- Guardiões selvagens, ritual de vínculo, equipe, experiência e habilidades;
- materiais, equipamentos procedurais, raridades, baús, loja e santuários;
- missões principais, contratos de caça, NPC e diálogos;
- HUD, minimapa, feedback de impacto, áudio procedural e controles mobile;
- save automático versionado em `localStorage`.

O gargalo principal já não é falta de mecânicas: é **separação de responsabilidades, criação de conteúdo e capacidade de crescer sem quebrar o que funciona**.

## Legenda

- **A — usar agora:** entra na primeira refatoração ou ajuda diretamente nela.
- **B — usar depois da paridade:** acrescentar quando o novo projeto já reproduzir a v4.11.
- **C — alternativa ou futuro:** boa tecnologia, mas não deve ser misturada sem necessidade.
- **Estudo:** observar arquitetura ou design; não copiar conteúdo protegido.

---

## 1. Base do jogo e engines — 15 repositórios

| # | Repositório | Prioridade | O que aproveitar no Reinos de Valdria |
|---:|---|---|---|
| 1 | [phaserjs/phaser](https://github.com/phaserjs/phaser) | **A · engine recomendada** | Cenas, câmera, tilemaps, sprites, animações, input por toque/teclado, partículas, áudio e pools. É a substituição natural para o render e os eventos hoje espalhados pelo HTML. |
| 2 | [phaserjs/template-vite-ts](https://github.com/phaserjs/template-vite-ts) | **A · ponto de partida** | Use como esqueleto do novo projeto com Phaser, Vite e TypeScript. Aproveite o boot, configuração, importação de assets e divisão inicial de cenas. |
| 3 | [phaserjs/examples](https://github.com/phaserjs/examples) | **A · consulta diária** | Exemplos oficiais para câmera, pointer, joystick, tilemap, animação, profundidade, partículas e áudio. Consulte por funcionalidade em vez de inventar uma implementação do zero. |
| 4 | [mapeditor/tiled](https://github.com/mapeditor/tiled) | **A · editor de mapas** | Desenhe aldeias e biomas em camadas. Use object layers para NPCs, spawns, baús, portais e regiões; exporte TMJ/JSON para o Phaser. A licença do editor não transforma seus mapas em GPL. |
| 5 | [RSamaium/RPG-JS](https://github.com/RSamaium/RPG-JS) | **B · framework/referência** | Estude mapas, eventos, NPCs, quests e separação cliente-servidor voltados a RPG. Avalie como alternativa completa; não tente colocar RPG-JS e Phaser como duas engines principais ao mesmo tempo. |
| 6 | [pixijs/pixijs](https://github.com/pixijs/pixijs) | **C · renderer alternativo** | Renderização 2D WebGL/WebGPU de alto desempenho. Só escolha Pixi no lugar do Phaser se quiser construir por conta própria cenas, entidades, colisão e ferramentas de jogo. |
| 7 | [pixijs-userland/tilemap](https://github.com/pixijs-userland/tilemap) | **C · mapas com Pixi** | Batching de grandes tilemaps. Útil apenas caso a opção final seja PixiJS em vez de Phaser. |
| 8 | [melonjs/melonJS](https://github.com/melonjs/melonJS) | **C · engine alternativa** | Compare o suporte a tilemaps, entidades, colisão e mobile. É uma alternativa web completa, mas oferece menos vantagem de ecossistema para este projeto que Phaser. |
| 9 | [excaliburjs/Excalibur](https://github.com/excaliburjs/Excalibur) | **C · engine TypeScript** | Boa referência de actors, scenes, actions e colisões fortemente tipadas. Interessante se a preferência futura for uma API muito orientada a TypeScript. |
| 10 | [KilledByAPixel/LittleJS](https://github.com/KilledByAPixel/LittleJS) | **C · engine pequena** | Estude um loop compacto, objetos, câmera e áudio procedural. Ótimo para entender fundamentos, mas o Valdria já pede mais ferramentas de conteúdo. |
| 11 | [straker/kontra](https://github.com/straker/kontra) | **C · microbiblioteca** | Loop, sprites, input e assets com pouca abstração. Serve para comparar com seu Canvas atual e entender o que uma camada mínima de engine resolve. |
| 12 | [rexrainbow/phaser3-rex-notes](https://github.com/rexrainbow/phaser3-rex-notes) | **B · plugins Phaser** | Escolha módulos pontuais para UI, grids, gestos, máquinas de estado e comportamentos. Não importe o pacote inteiro sem necessidade. |
| 13 | [godotengine/godot](https://github.com/godotengine/godot) | **C · alternativa de engine** | Excelente editor 2D, cenas, animação e exportação. Use se no futuro você aceitar reescrever a lógica em GDScript/C# para ganhar um fluxo mais visual. |
| 14 | [godotengine/godot-demo-projects](https://github.com/godotengine/godot-demo-projects) | **C · referência Godot** | Demonstrações oficiais de tilemaps, navegação, animação, UI, áudio e mobile. Consulte antes de decidir por uma migração de engine. |
| 15 | [defold/defold](https://github.com/defold/defold) | **C · alternativa mobile** | Engine enxuta com bom desempenho e exportação mobile. Exigiria reescrita em Lua, então é candidata de longo prazo, não ferramenta da refatoração atual. |

## 2. Arquitetura, estado, testes e desempenho — 10 repositórios

| # | Repositório | Prioridade | O que aproveitar no Reinos de Valdria |
|---:|---|---|---|
| 16 | [Bitecs/Bitecs](https://github.com/Bitecs/Bitecs) | **B · ECS** | Separação entre dados e sistemas para muitos monstros, projéteis e efeitos. Só adote depois da paridade; classes e módulos simples bastam no primeiro corte. |
| 17 | [hmans/miniplex](https://github.com/hmans/miniplex) | **B · ECS TypeScript** | ECS mais acessível e tipado. Pode organizar entidades por componentes como posição, vida, hostil, capturável e renderizável sem heranças profundas. |
| 18 | [ecsyjs/ecsy](https://github.com/ecsyjs/ecsy) | **Estudo · arquivado** | Estude a divisão entidade–componente–sistema e queries. O repositório está arquivado; não seria minha dependência nova. |
| 19 | [pmndrs/zustand](https://github.com/pmndrs/zustand) | **B · estado de interface** | Se houver uma camada React para menus, use um store pequeno para HUD, inventário e configurações. Não coloque o loop de combate inteiro dentro do React. |
| 20 | [immerjs/immer](https://github.com/immerjs/immer) | **B · estado imutável** | Útil para alterações previsíveis em save, inventário, aldeias e quests, além de facilitar histórico e testes. Use apenas nos estados que se beneficiam disso. |
| 21 | [jakesgordon/javascript-state-machine](https://github.com/jakesgordon/javascript-state-machine) | **A · estados** | Modele `intro`, `jogando`, `dialogando`, `loja`, `morto` e `pausado`; também estados de IA como patrulha, perseguição, ataque e retorno ao spawn. |
| 22 | [colinhacks/zod](https://github.com/colinhacks/zod) | **A · validação de dados** | Valide arquivos JSON de monstros, itens, biomas e quests, além de saves antigos antes de migrá-los. Evita um dado quebrado derrubar o jogo. |
| 23 | [vitest-dev/vitest](https://github.com/vitest-dev/vitest) | **A · testes unitários** | Teste dano, XP, drop, vínculo, equipamentos, missões, pathfinding, save e migrações sem abrir o Canvas. É a proteção principal durante a extração do HTML. |
| 24 | [microsoft/playwright](https://github.com/microsoft/playwright) | **A · teste de fluxo** | Faça smoke tests: iniciar jogo, escolher classe, mover em diagonal, abrir diálogo, salvar, recarregar e continuar. Rode também em viewport de celular. |
| 25 | [mrdoob/stats.js](https://github.com/mrdoob/stats.js) | **B · desempenho** | Overlay de FPS e tempo de frame durante desenvolvimento. Ajuda a medir spawns, pathfinding e render antes de otimizar por sensação. |

## 3. Mapas, biomas, pathfinding, IA e narrativa — 17 repositórios

| # | Repositório | Prioridade | O que aproveitar no Reinos de Valdria |
|---:|---|---|---|
| 26 | [deepnight/ldtk](https://github.com/deepnight/ldtk) | **C · editor alternativo** | Editor 2D orientado a níveis com entidades e campos tipados. Compare com Tiled; escolha um só para ser a fonte oficial dos mapas. |
| 27 | [prettymuchbryce/easystarjs](https://github.com/prettymuchbryce/easystarjs) | **B · A* em grid** | Pode substituir ou validar o A* atual. Suporta custos por tile e diagonais; ideal para lama, estrada, areia e água terem velocidades diferentes. |
| 28 | [qiao/PathFinding.js](https://github.com/qiao/PathFinding.js) | **Estudo · algoritmos** | Compare A*, Jump Point Search, Dijkstra e bi-direcional. Use para benchmark em mapas maiores, não para instalar cinco algoritmos sem demanda. |
| 29 | [bgrins/javascript-astar](https://github.com/bgrins/javascript-astar) | **Estudo · A*** | Implementação legível para revisar heurística, pesos e estrutura do seu próprio pathfinding. |
| 30 | [mikewesthad/navmesh](https://github.com/mikewesthad/navmesh) | **C · movimento livre** | Navegação por polígonos para uma futura movimentação realmente contínua. Hoje o jogo é tile-based; não migre antes de decidir abandonar a grade. |
| 31 | [ondras/rot.js](https://github.com/ondras/rot.js) | **B · geração e visão** | Field of view, mapas, ruído, agendadores e utilidades de roguelike. Excelente para cavernas, neblina de guerra e turnos de simulação fora da tela. |
| 32 | [Auburn/FastNoiseLite](https://github.com/Auburn/FastNoiseLite) | **B · geração procedural** | Gere mapas de altura, umidade e temperatura para combinar biomas de forma repetível por seed. Use o port JavaScript/TypeScript. |
| 33 | [josephg/noisejs](https://github.com/josephg/noisejs) | **B · ruído simples** | Alternativa pequena para Perlin/Simplex. Boa para testar manchas de floresta, praias, minérios e decoração sem criar dependência pesada. |
| 34 | [jwagner/simplex-noise.js](https://github.com/jwagner/simplex-noise.js) | **B · Simplex noise** | Gere transições menos retangulares entre campos, floresta, neve, pântano e deserto. Escolha este ou FastNoiseLite, não ambos sem motivo. |
| 35 | [redblobgames/mapgen2](https://github.com/redblobgames/mapgen2) | **Estudo · continentes** | Referência excelente para elevação, rios, umidade e biomas em ilhas. Aproveite conceitos e visualizações para o mapa-múndi. |
| 36 | [redblobgames/dual-mesh](https://github.com/redblobgames/dual-mesh) | **Estudo · regiões** | Modele regiões, fronteiras e vizinhança entre aldeias/biomas. Útil se o mapa global deixar de ser apenas uma grade uniforme. |
| 37 | [d3/d3-delaunay](https://github.com/d3/d3-delaunay) | **C · Voronoi** | Distribua aldeias, pontos de interesse e territórios com Voronoi/Delaunay. Use para geração macro, não para colisão tile a tile. |
| 38 | [mourner/rbush](https://github.com/mourner/rbush) | **B · índice espacial** | Encontre rapidamente entidades próximas, alvos, drops e objetos visíveis quando o mapa e a população crescerem. |
| 39 | [nkholski/phaser-animated-tiles](https://github.com/nkholski/phaser-animated-tiles) | **B · tiles animados** | Água, lava, tochas, plantações e portais animados definidos no Tiled. Teste compatibilidade com a versão escolhida do Phaser antes de fixar a dependência. |
| 40 | [nikkorn/mistreevous](https://github.com/nikkorn/mistreevous) | **B · behavior trees** | Organize IA de monstros, Guardiões e moradores: vagar, trabalhar, dormir, fugir, perseguir, defender aldeia e voltar para casa. |
| 41 | [inkle/ink](https://github.com/inkle/ink) | **B · narrativa ramificada** | Escreva diálogos e quests com escolhas, condições e variáveis fora do código. Bom para reputação, facções e consequências entre aldeias. |
| 42 | [YarnSpinnerTool/YarnSpinner](https://github.com/YarnSpinnerTool/YarnSpinner) | **C · diálogo alternativo** | Outra ótima referência para conversas ramificadas e localização. Compare com Ink e escolha apenas um formato narrativo. |

## 4. RPGs completos, Tibia, criaturas, aldeias e progressão — 25 repositórios

> Os projetos desta seção são principalmente **referências de arquitetura e game design**. Os que usam Tibia ou Pokémon exigem cuidado especial: não reutilize nomes, mapas, sprites, músicas, sons ou bancos de dados protegidos.

| # | Repositório | Prioridade | O que aproveitar no Reinos de Valdria |
|---:|---|---|---|
| 43 | [Kaetram/Kaetram-Open](https://github.com/Kaetram/Kaetram-Open) | **B · MMORPG web** | Referência muito próxima da direção do Valdria: mundo 2D online, entidades, combate, inventário, quests, cliente e servidor. Estude limites entre regra autoritativa e apresentação. |
| 44 | [RedN/rainingchain](https://github.com/RedN/rainingchain) | **B · MMORPG em JavaScript** | Organização de conteúdo, mapas, habilidades, NPCs e servidor de um RPG de navegador. Útil para entender como dados de jogo crescem sem virar um arquivo único. |
| 45 | [arianne/stendhal](https://github.com/arianne/stendhal) | **Estudo · MMORPG 2D** | Zonas, NPCs, diálogos, quests, loot, comércio, respawn e persistência de um mundo 2D com sensação próxima de Tibia. |
| 46 | [mozilla/BrowserQuest](https://github.com/mozilla/BrowserQuest) | **Estudo · arquivado** | Exemplo histórico claro de cliente web + servidor autoritativo, mensagens de movimento, combate e grupos. Não use como stack moderna pronta. |
| 47 | [ill-inc/biomes-game](https://github.com/ill-inc/biomes-game) | **C · MMO web moderno** | ECS, jobs, persistência, sincronização e mundo online em TypeScript/React/WebAssembly. É enorme; consulte subsistemas específicos, não tente reproduzir a arquitetura inteira. |
| 48 | [otland/forgottenserver](https://github.com/otland/forgottenserver) | **Estudo · servidor OpenTibia** | Spawns, monstros, loot tables, mapa persistente, combate, scripts e separação servidor/conteúdo. Verifique a GPL antes de incorporar código e use somente conteúdo original. |
| 49 | [edubart/otclient](https://github.com/edubart/otclient) | **Estudo · cliente OpenTibia** | Minimap, painéis, input, módulos de interface e organização de um cliente 2D. Não reutilize assets ou conteúdo de Tibia. |
| 50 | [opentibiabr/canary](https://github.com/opentibiabr/canary) | **Estudo · servidor modular** | Referência mais moderna de módulos, scripts, criaturas, itens, quests e ferramentas de servidor no ecossistema OpenTibia. |
| 51 | [Tuxemon/Tuxemon](https://github.com/Tuxemon/Tuxemon) | **B · monster-taming aberto** | Equipe, captura, movimentos, tipos, condições, encontros, NPCs e progressão. É a referência conceitualmente mais segura para Guardiões; ainda confira a licença de cada asset. |
| 52 | [lucidtanooki/guardian_monsters](https://github.com/lucidtanooki/guardian_monsters) | **Estudo · monster-taming** | Compare loop de exploração, encontro, captura e crescimento de criaturas. O nome também combina com seu conceito, mas mantenha identidade e código próprios. |
| 53 | [LibreGamesArchive/monster-rpg-2](https://github.com/LibreGamesArchive/monster-rpg-2) | **Estudo · histórico** | RPG completo para observar mapas, batalhas, inventário e quests em uma base antiga. Útil para conceitos, não como fundação técnica atual. |
| 54 | [smogon/pokemon-showdown](https://github.com/smogon/pokemon-showdown) | **Estudo · motor de batalha** | Turnos determinísticos, prioridade, efeitos, status, validação de equipes e logs reproduzíveis. Recrie o modelo com Guardiões, tipos e nomes originais; não copie os dados Pokémon. |
| 55 | [PokeAPI/pokeapi](https://github.com/PokeAPI/pokeapi) | **Estudo · modelagem de dados** | Observe relacionamentos entre espécie, forma, habilidade, movimento, tipo, evolução e encontro. Use a estrutura como inspiração para criar seu próprio `guardians.json`. |
| 56 | [pret/pokeemerald](https://github.com/pret/pokeemerald) | **Estudo · propriedade intelectual** | Map connections, eventos, encontros por área, party, boxes e progressão por flags. Não reutilize ROM, gráficos, áudio, mapas, textos ou personagens. |
| 57 | [rh-hideout/pokeemerald-expansion](https://github.com/rh-hideout/pokeemerald-expansion) | **Estudo · sistemas de criatura** | Organização data-driven de movimentos, habilidades, tipos, efeitos e balanceamento. Use somente padrões abstratos com conteúdo original. |
| 58 | [pret/pokecrystal](https://github.com/pret/pokecrystal) | **Estudo · mundo e eventos** | Conexões entre mapas, eventos condicionais, encontros, relógio e ciclo dia/noite. Mesma restrição: estudar estrutura, não copiar propriedade intelectual. |
| 59 | [aaron5670/PokeMMO-Online-Realtime-Multiplayer-Game](https://github.com/aaron5670/PokeMMO-Online-Realtime-Multiplayer-Game) | **Estudo · Phaser + Colyseus** | Exemplo direto de criatura + multiplayer usando Phaser e Colyseus. Observe fluxo de mensagens e salas; descarte nomes, gráficos e dados Pokémon. |
| 60 | [mimikim/harvest-moon-phaser3-game](https://github.com/mimikim/harvest-moon-phaser3-game) | **Estudo · fazenda em Phaser** | Ciclo de dias, plantações, interação com tiles, coleta e evento com prazo. Adapte a lógica para fazendas e evolução das aldeias; não reutilize assets de franquias. |
| 61 | [unknown-horizons/unknown-horizons](https://github.com/unknown-horizons/unknown-horizons) | **Estudo · assentamentos** | Cadeias de produção, trabalhadores, construções, recursos, necessidades e evolução de assentamentos. Excelente base conceitual para suas aldeias. |
| 62 | [Anuken/Mindustry](https://github.com/Anuken/Mindustry) | **Estudo · progressão** | Tech tree, recursos, produção, ondas, desbloqueios e conteúdo data-driven. Adapte a clareza da progressão, não o gênero de fábrica inteiro. |
| 63 | [tobspr-games/shapez.io](https://github.com/tobspr-games/shapez.io) | **Estudo · economia e desbloqueios** | Metas encadeadas, produção incremental, upgrades e save de mundo grande. Ajuda a desenhar uma aldeia que evolui por entregas e infraestrutura. |
| 64 | [CleverRaven/Cataclysm-DDA](https://github.com/CleverRaven/Cataclysm-DDA) | **Estudo · conteúdo data-driven** | Catálogos extensos de itens, receitas, monstros, biomas e condições em dados externos. Ótima referência para retirar conteúdo do código. |
| 65 | [wesnoth/wesnoth](https://github.com/wesnoth/wesnoth) | **Estudo · mapas e campanhas** | Terrenos, unidades, resistências, campanhas, eventos e IA declarativa. Útil para balancear biomas e progressão regional. |
| 66 | [luanti-org/luanti](https://github.com/luanti-org/luanti) | **Estudo · mundo modular** | Registro de conteúdo, mods, crafting e geração procedural. Inspire-se na capacidade de adicionar biomas e itens sem alterar o núcleo. |
| 67 | [veloren/veloren](https://github.com/veloren/veloren) | **C · RPG de mundo aberto** | Biomas, loot, crafting, economia e geração de mundo em grande escala. Consulte o design de sistemas; a tecnologia Rust/3D não é para portar diretamente. |

## 5. Multiplayer, saves, build e aplicativo — 11 repositórios

| # | Repositório | Prioridade | O que aproveitar no Reinos de Valdria |
|---:|---|---|---|
| 68 | [colyseus/colyseus](https://github.com/colyseus/colyseus) | **C · multiplayer recomendado** | Salas autoritativas, schema sincronizado, matchmaking e reconexão em TypeScript. É minha primeira opção se o multiplayer realmente entrar depois do single-player estável. |
| 69 | [heroiclabs/nakama](https://github.com/heroiclabs/nakama) | **C · backend de jogo** | Contas, armazenamento, partidas, grupos, placares e funções de servidor. Mais completo e operacionalmente mais pesado que Colyseus. |
| 70 | [socketio/socket.io](https://github.com/socketio/socket.io) | **C · transporte em tempo real** | Eventos, salas, reconexão e comunicação bidirecional. Ele não entrega regras autoritativas nem anti-cheat sozinho; isso continua sendo responsabilidade do servidor. |
| 71 | [geckosio/geckos.io](https://github.com/geckosio/geckos.io) | **C · movimento frequente** | Comunicação de baixa latência e mensagens não confiáveis para posições. Só vale quando houver multiplayer com atualização frequente de movimento. |
| 72 | [lance-gg/lance](https://github.com/lance-gg/lance) | **Estudo · netcode** | Predição do cliente, reconciliação e sincronização de objetos. Mesmo que não use a biblioteca, os padrões ajudam a evitar movimento online travado. |
| 73 | [dexie/Dexie.js](https://github.com/dexie/Dexie.js) | **A · save recomendado** | IndexedDB com versões e transações. Migre do `localStorage` quando o save passar a incluir mundo, aldeias, inventário, coleção e configurações. |
| 74 | [localForage/localForage](https://github.com/localForage/localForage) | **C · save simples** | API parecida com storage, mas assíncrona e capaz de usar IndexedDB. É mais fácil que Dexie, porém menos forte para consultas e migrações complexas. |
| 75 | [jakearchibald/idb](https://github.com/jakearchibald/idb) | **C · IndexedDB leve** | Wrapper fino e moderno. Escolha `idb` se quiser controle baixo nível; escolha Dexie se quiser schema, tabelas e migrações mais confortáveis. |
| 76 | [vitejs/vite](https://github.com/vitejs/vite) | **A · build** | Módulos ES, TypeScript, servidor rápido, importação de assets e build otimizado. É a base para deixar de editar um HTML monolítico. |
| 77 | [vite-pwa/vite-plugin-pwa](https://github.com/vite-pwa/vite-plugin-pwa) | **B · PWA** | Instalação na tela inicial, manifest, cache offline e atualização controlada. Configure para não deixar jogadores presos em uma versão antiga. |
| 78 | [ionic-team/capacitor](https://github.com/ionic-team/capacitor) | **B · Android/iOS** | Empacote o jogo web como aplicativo e acesse vibração, status bar, armazenamento e outros recursos nativos sem abandonar TypeScript. |

## 6. Áudio, pixel art e recursos — 8 repositórios

| # | Repositório | Prioridade | O que aproveitar no Reinos de Valdria |
|---:|---|---|---|
| 79 | [goldfire/howler.js](https://github.com/goldfire/howler.js) | **B · áudio recomendado** | Gerencie músicas e efeitos, volumes separados, loops, sprites de áudio e desbloqueio em mobile. Substitui o áudio procedural atual quando entrarem assets reais. |
| 80 | [pixijs/sound](https://github.com/pixijs/sound) | **C · áudio para Pixi** | Use apenas se PixiJS virar o renderer principal. Com Phaser, prefira o sistema nativo ou Howler, evitando duas camadas de áudio. |
| 81 | [Tonejs/Tone.js](https://github.com/Tonejs/Tone.js) | **C · música procedural** | Sequências, sintetizadores e efeitos via Web Audio. Pode gerar ambiências mágicas, mas não precisa entrar no primeiro refactor. |
| 82 | [sanderfrenken/Universal-LPC-Spritesheet-Character-Generator](https://github.com/sanderfrenken/Universal-LPC-Spritesheet-Character-Generator) | **B · personagens modulares** | Gere corpos, roupas, armaduras, cabelos e animações em camadas. Confira e registre a licença/atribuição de cada peça exportada. |
| 83 | [Orama-Interactive/Pixelorama](https://github.com/Orama-Interactive/Pixelorama) | **B · editor de pixel art** | Crie e anime personagens, criaturas, tiles e efeitos. Bom para manter uma identidade visual original e exportar spritesheets. |
| 84 | [LibreSprite/LibreSprite](https://github.com/LibreSprite/LibreSprite) | **B · editor de sprites** | Alternativa livre para edição de pixel art e animações frame a frame. |
| 85 | [piskelapp/piskel](https://github.com/piskelapp/piskel) | **B · editor no navegador** | Ferramenta simples para rascunhar sprites e animações rapidamente, inclusive quando você estiver trabalhando apenas pelo celular/navegador. |
| 86 | [teamgravitydev/gamedev-free-resources](https://github.com/teamgravitydev/gamedev-free-resources) | **B · catálogo de recursos** | Lista de arte, áudio, fontes e ferramentas. Cada recurso tem licença própria; nunca trate “gratuito” como sinônimo de “livre para qualquer uso”. |

---

## Os 12 que eu abriria primeiro

Não instale 86 dependências. Esta lista é uma biblioteca de estudo. Para a próxima fase real do Valdria, a ordem prática é:

1. **phaserjs/template-vite-ts** — criar a nova estrutura;
2. **phaserjs/phaser** — engine principal;
3. **phaserjs/examples** — consulta de implementação;
4. **mapeditor/tiled** — mapas, aldeias e regiões;
5. **vitest-dev/vitest** — proteger regras existentes;
6. **microsoft/playwright** — smoke test mobile;
7. **colinhacks/zod** — validar conteúdo e saves;
8. **dexie/Dexie.js** — save versionado quando necessário;
9. **goldfire/howler.js** — áudio quando houver trilha e SFX reais;
10. **Tuxemon/Tuxemon** — referência para Guardiões;
11. **Kaetram/Kaetram-Open** — referência de RPG web;
12. **unknown-horizons/unknown-horizons** — referência para evolução de aldeias.

O A* atual pode continuar no início. Só troque por EasyStar ou outra solução se testes mostrarem um problema real.

## Estrutura de pastas sugerida

```text
reinos-de-valdria/
├── public/
│   └── assets/
│       ├── audio/
│       ├── fonts/
│       ├── sprites/
│       ├── tilesets/
│       └── ui/
├── src/
│   ├── main.ts
│   ├── game/
│   │   ├── config.ts
│   │   ├── scenes/
│   │   │   ├── BootScene.ts
│   │   │   ├── MenuScene.ts
│   │   │   ├── WorldScene.ts
│   │   │   └── UIScene.ts
│   │   ├── entities/
│   │   │   ├── Player.ts
│   │   │   ├── Monster.ts
│   │   │   ├── Guardian.ts
│   │   │   └── NPC.ts
│   │   ├── systems/
│   │   │   ├── movement.ts
│   │   │   ├── pathfinding.ts
│   │   │   ├── combat.ts
│   │   │   ├── capture.ts
│   │   │   ├── loot.ts
│   │   │   ├── quests.ts
│   │   │   └── village.ts
│   │   ├── data/
│   │   │   ├── biomes.ts
│   │   │   ├── classes.ts
│   │   │   ├── guardians.ts
│   │   │   ├── items.ts
│   │   │   ├── monsters.ts
│   │   │   └── quests.ts
│   │   ├── map/
│   │   │   ├── loaders.ts
│   │   │   ├── regions.ts
│   │   │   └── world.ts
│   │   ├── save/
│   │   │   ├── schema.ts
│   │   │   ├── migrations.ts
│   │   │   └── storage.ts
│   │   └── ui/
│   │       ├── hud.ts
│   │       ├── joystick.ts
│   │       └── dialogs.ts
│   └── styles/
│       └── game.css
├── tests/
│   ├── combat.test.ts
│   ├── movement.test.ts
│   ├── pathfinding.test.ts
│   ├── quests.test.ts
│   └── save-migrations.test.ts
├── e2e/
│   └── mobile-smoke.spec.ts
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Roteiro de refatoração sem perder o jogo atual

### Etapa 1 — congelar a versão funcional

- Guarde a v4.11 como baseline jogável.
- Liste comportamentos que não podem mudar: diagonal, perseguição, habilidade em buffer, vínculo, loot e save.
- Crie testes para fórmulas e estados puros antes de mover código.

### Etapa 2 — modularizar ainda no Canvas

- Extraia primeiro `data`, `combat`, `movement`, `pathfinding`, `quests` e `save`.
- Mantenha o desenho existente temporariamente.
- O objetivo é mudar a organização, não a sensação do jogo.

### Etapa 3 — Vite e TypeScript

- Comece pelo template oficial do Phaser.
- Tipifique `Player`, `Monster`, `Guardian`, `Equipment`, `Quest` e `SaveGame`.
- Valide conteúdo e save com Zod.

### Etapa 4 — migrar a apresentação para Phaser

- `BootScene`: carregamento de assets;
- `MenuScene`: introdução, classe, continuar e novo jogo;
- `WorldScene`: mapa, entidades, combate e interação;
- `UIScene`: HUD, joystick, minimapa, diálogos e loja.

Primeiro reproduza a v4.11. Não acrescente cinco biomas enquanto a migração ainda estiver incompleta.

### Etapa 5 — mapa autoral no Tiled

- Separe chão, decoração, colisão, cobertura e objetos;
- marque biomas e regiões por propriedades;
- use objetos para spawns, NPCs, baús, santuários, entradas e saídas;
- mantenha IDs estáveis para que o save saiba qual baú ou aldeia foi alterado.

### Etapa 6 — conteúdo data-driven

- Monstros, Guardiões, itens, materiais, biomas, receitas e quests devem sair do código;
- cada conteúdo recebe um ID permanente, como `guardian_raposa_brasa`;
- código executa regras; arquivos de dados descrevem conteúdo.

### Etapa 7 — aldeias e progressão

Comece com uma única aldeia e três níveis:

1. **Acampamento:** ferreiro e curandeira;
2. **Aldeia:** fazenda, loja e quadro de contratos;
3. **Vila fortificada:** criação de Guardiões, expedições e defesa.

Cada evolução deve desbloquear serviço, aparência e uma nova rota de progressão — não apenas aumentar um número.

### Etapa 8 — PWA e aplicativo

- PWA quando a versão modular estiver estável;
- Capacitor quando controles, safe areas, áudio e save tiverem sido testados em aparelhos reais;
- multiplayer somente depois de o single-player ter regras claras e save confiável.

## Regras de licença e segurança jurídica

1. **Leia o arquivo `LICENSE` do repositório e dos assets antes de copiar qualquer coisa.** A licença pode mudar e subpastas podem ter termos diferentes.
2. Licenças copyleft como GPL/AGPL podem exigir disponibilização do código derivado. Se você não quer essa obrigação, use esses projetos como estudo arquitetural e escreva sua própria implementação.
3. Código aberto não significa que todos os sprites, músicas, fontes e marcas dentro do projeto estejam liberados da mesma forma.
4. Repositórios de Pokémon e OpenTibia devem ser tratados como referência técnica. Crie criaturas, elementos, mapas, nomes, sons, textos e identidade visual próprios.
5. Mantenha um arquivo `ASSET_LICENSES.md` registrando origem, autor, licença, link e alterações de todo asset externo.
6. Quando adaptar uma ideia, copie o **padrão**, não uma grande porção de código cuja licença seja incompatível.

## Decisão final recomendada

O Reinos de Valdria já tem identidade de jogo. Ele não precisa ser descartado para “virar um jogo de verdade”. A melhor próxima evolução é transformar a v4.11 em uma base modular mantendo o gameplay atual:

```text
HTML único
   ↓
JavaScript em módulos + testes
   ↓
TypeScript + Vite
   ↓
Phaser + Tiled
   ↓
conteúdo data-driven + aldeias
   ↓
PWA/Capacitor
   ↓
multiplayer, apenas se ainda fizer sentido
```

Os repositórios acima devem funcionar como uma biblioteca de soluções. A arquitetura principal precisa continuar simples o bastante para você entender, testar e evoluir pelo celular e, depois, pelo computador.
