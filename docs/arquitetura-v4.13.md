# Arquitetura da v4.13

## Limite de segurança

O projeto possui dois clientes durante a migração:

| Cliente | Entrada | Responsabilidade |
|---|---|---|
| Legado estável | \`index.html\` + \`public/game\` | aventura completa e formato de save v2 |
| Fundação | \`modern.html\` + \`src\` | arquitetura nova, dados, testes e provas de migração |

O cliente novo só assume uma mecânica quando reproduz o comportamento do legado e possui teste. Até lá, o legado continua sendo a versão jogável oficial.

## Camadas

| Camada | Pode conhecer | Não deve conhecer |
|---|---|---|
| \`data\` | schemas e catálogos | Phaser, DOM, localStorage |
| \`systems\` | dados e regras puras | Canvas, cenas, botões |
| \`save\` | schemas, migrações e IndexedDB | renderização |
| \`assets\` | manifesto e metadados | regras de combate |
| \`scenes\` | Phaser, dados e sistemas públicos | estrutura interna do IndexedDB |
| \`audio\` | Howler e IDs de som | lógica de missão |

## Fluxo pretendido

1. a cena recebe input;
2. chama um sistema com dados simples;
3. o sistema retorna o novo estado ou um evento;
4. a cena renderiza o resultado;
5. eventos persistentes são enviados ao repositório de save;
6. áudio e UI reagem ao evento sem alterar a regra.

## Conteúdo data-driven

Biomas, classes, Guardiões, itens, monstros, missões e estágios de aldeia ficam em \`src/game/data\`. Zod valida o conjunto inteiro no boot e nos testes. Um ID inválido deve falhar no desenvolvimento antes de chegar ao jogador.

## Save

- v2: continua no \`localStorage\` e pertence ao jogo atual;
- v3: formato tipado em \`save/schema.ts\`;
- migração: converte posição, classe, inventário, materiais, equipe, Guardião ativo, baús, santuários, mortes e flags;
- destino futuro: uma tabela Dexie/IndexedDB por slot;
- regra: a importação nunca remove automaticamente a chave antiga.

## Assets

Todo arquivo deve existir no manifesto e no registro de licenças. Material conceitual permanece em \`assets/raw\`; somente arquivos dimensionados, licenciados e testados saem para sprites, tilesets, áudio ou UI.

## Decisões adiadas de propósito

- ECS só depois de medir quantidade de entidades e custo do loop;
- multiplayer só depois da paridade single-player;
- Capacitor depois da PWA estável;
- Tiled quando houver primeiro tileset aprovado;
- Ink ou Yarn somente quando diálogos ramificados justificarem um formato próprio;
- nenhuma segunda engine será adicionada enquanto Phaser for a escolha vigente.
