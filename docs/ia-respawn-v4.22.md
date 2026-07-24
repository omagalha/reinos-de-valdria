# IA, território e respawn — v4.22

Os monstros agora possuem os estados `idle`, `chasing`, `attacking`,
`returning` e `defeated`.

- espécies territoriais detectam o jogador dentro de sua visão;
- o Esporo Errante espera o jogador se aproximar para sair da emboscada;
- criaturas que se afastam demais retornam ao ponto definido no TMJ;
- monstros derrotados reaparecem com vida completa após oito segundos;
- o respawn aguarda se o ponto estiver ocupado;
- jogador e criaturas não podem atravessar ou ocupar o mesmo espaço.

## Decisão sobre os 86 repositórios

Foram revistos Phaser Examples, a máquina de estados, Miniplex, EasyStar,
RBush, Mistreevous e as referências de RPG/MMORPG da matriz. Nenhuma nova
dependência foi adicionada:

- o A* atual continua suficiente, conforme a recomendação do guia;
- quatro monstros não justificam ainda um índice espacial como RBush;
- a máquina de estados pequena é suficiente antes de adotar behavior trees;
- ECS será reavaliado quando a quantidade e variedade de entidades crescer.

## Limitações

- a movimentação da IA ainda ocorre em passos simples, sem A*;
- não há animação visual dos estados;
- respawns não são persistidos no save;
- parâmetros de território e tempo de respawn ainda são provisórios.
