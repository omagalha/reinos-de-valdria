# Classes e ataques — v4.19

A entrada Phaser agora permite escolher Cavaleiro, Arqueiro ou Mago antes de
entrar nos Campos de Valdria. HP, dano, alcance e intervalo de ataque vêm de
`catalogs.json`.

## Funcionamento

- Cavaleiro ataca de perto;
- Arqueiro dispara um projétil provisório a até três tiles;
- Mago dispara energia provisória a até dois tiles;
- clique ou toque em um Ratino para selecioná-lo;
- use `F` ou o botão `ATACAR`.

As formas e cores são provisórias e geradas pelo Phaser, portanto nenhum asset
externo foi introduzido.

## Limitações

- ainda não há habilidades, mana ou ataques em área;
- o projétil é visual e não possui colisão independente;
- não há animações ou áudio de combate;
- classe, HP, XP e drops ainda duram somente a sessão;
- Guardiões e vínculo continuam fora desta versão.
