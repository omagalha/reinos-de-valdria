# Equipe de Guardiões — v4.27

A v4.27 remove a limitação que fazia o laboratório Phaser restaurar sempre
Folium. O companheiro ativo agora é resolvido pelo `activeGuardianId` do save
v3 e seus dados de espécie vêm de `catalogs.json`.

## Como usar

- pressione `R` no teclado ou `TROCAR` no controle mobile;
- a seleção percorre a equipe em ciclo;
- um membro desmaiado é ignorado quando existe outro desperto;
- cada Guardião conserva HP, nível, XP e tempo de recuperação;
- a troca provoca uma gravação imediata.

Saves importados do Canvas que já possuem Aquari ou outra espécie podem
restaurá-la como ativa. Um jogo novo continua oferecendo somente Folium nos
Campos de Valdria, pois novas espécies devem aparecer nos seus biomas próprios.

## Decisões e limites

A matriz dos 86 repositórios foi revisada. A equipe foi implementada como regra
pequena e testável, sem copiar código externo e sem adicionar dependência.

- somente um Guardião é renderizado e combate por vez;
- a representação visual ainda usa a silhueta provisória do laboratório;
- novos encontros vinculáveis dependem dos próximos mapas;
- ainda não existe tela para ordenar, renomear ou dispensar membros.
