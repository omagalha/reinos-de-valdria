# Especificação de assets v4.13

## Unidade visual

- grade lógica: 32 × 32 pixels;
- câmera e Canvas podem ampliar por números inteiros para preservar pixels;
- sem suavização na renderização;
- origem de personagens: centro inferior do tile;
- cada spritesheet deve ter fundo transparente e margem externa de 1 pixel;
- nomes de arquivo em kebab-case, por exemplo \`folium-idle.png\`.

## Sprites de personagens e NPCs

| Ação | Direções | Quadros por direção | Tamanho por quadro |
|---|---:|---:|---:|
| Parado | 4 | 2 | 32 × 48 |
| Caminhada | 4 | 6 | 32 × 48 |
| Ataque | 4 | 6 | 48 × 48 |
| Dano | 4 | 2 | 32 × 48 |
| Queda | 1 | 6 | 48 × 48 |

As oito direções podem ser adotadas depois. Primeiro devem existir quatro direções completas e consistentes.

## Guardiões e monstros

- base pequena: 32 × 32;
- base média: 48 × 48;
- chefes: até 96 × 96;
- animações mínimas: parado, mover, atacar, sofrer dano e vínculo/queda;
- silhueta, olhos e cor de destaque devem permitir reconhecer cada espécie na tela do celular;
- Guardiões devem ser originais e não usar símbolos, cápsulas, proporções ou silhuetas reconhecíveis de franquias existentes.

## Tilesets

Cada bioma terá um tileset separado:

1. Campos de Valdria;
2. Bosque Sussurrante;
3. Praia Solar;
4. Caverna Sombria;
5. Pântano Luminoso;
6. Serras Geladas.

O primeiro pacote de cada bioma precisa conter chão base, três variações, bordas, cantos internos e externos, obstáculo, decoração, entrada/saída e tile de interação. Tiled será a fonte oficial dos mapas; o Phaser carregará TMJ/JSON.

## Aldeias

Os três estágios compartilham os mesmos pontos de referência para permitir evolução sem teletransportar NPCs:

| Estágio | Elementos obrigatórios |
|---|---|
| Acampamento | fogueira, tenda, bancada, baú |
| Aldeia Viva | casas, horta, ferreiro, estalagem, quadro de contratos |
| Fortificada | muralha, portão, torre, santuário, área de expedições |

## Áudio

- música: OGG ou WebM Opus, loop testado;
- efeitos: OGG e, se necessário para compatibilidade, MP3;
- volumes separados em música e efeitos;
- nomes por evento, como \`combat-hit-light.ogg\`;
- o áudio procedural atual continua como fallback até existirem arquivos aprovados.

## Critério de entrada na build

Um asset só sai de \`raw\` quando:

1. dimensões e pivô estão corretos;
2. animação não treme entre quadros;
3. funciona em escala 1× e 2×;
4. origem e licença foram registradas;
5. o manifesto aponta para um arquivo existente;
6. existe um fallback ou tratamento de erro.
