# Primeiro vínculo Phaser — v4.23

Folium agora nasce no objeto `guardian_spawns` dos Campos de Valdria. Sua
espécie, HP, dano, elemento e dificuldade de vínculo vêm de `catalogs.json`.

## Fluxo

1. encontre e selecione Folium;
2. use ataque comum ou habilidade para reduzir seu HP;
3. Folium nunca cai abaixo de 1 HP;
4. aproxime-se e pressione `V` ou `VÍNCULO`;
5. cada tentativa consome um Núcleo de Essência;
6. quanto menor o HP, maior a chance;
7. no sucesso, Folium entra na equipe provisória.

Três núcleos provisórios são entregues no início de cada sessão para permitir o
teste. Eles serão substituídos pelo crafting e inventário persistente em uma
etapa futura.

## Repositórios consultados

Tuxemon orientou a separação já existente entre espécie e instância. PokeAPI e
Cataclysm-DDA reforçam o conteúdo data-driven. Guardian Monsters e motores de
batalha foram mantidos apenas como estudo; nenhum código, nome ou asset externo
foi copiado.

## Limitações

- Folium ainda não acompanha nem combate ao lado do jogador;
- não há ataque ou IA do Guardião selvagem;
- equipe, núcleos e vínculo duram somente a sessão;
- tentativa falha ainda não causa fuga ou reposicionamento;
- efeitos e aparência são provisórios.
