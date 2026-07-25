# Dano e recuperação do Guardião — v4.26

Monstros agora escolhem entre o jogador e Folium conforme a proximidade. Se
Folium estiver mais perto, ele recebe o ataque.

## Ciclo

1. Folium recebe dano usando a faixa do monstro no catálogo;
2. ao chegar a 0 HP, fica desmaiado;
3. para de seguir, atacar e usar Raiz Vital;
4. o HUD mostra o tempo restante;
5. após 20 segundos, desperta perto do jogador;
6. retorna com metade do HP máximo.

O comportamento preserva o ciclo do Canvas. `fainted` e
`reviveRemainingMs` foram adicionados ao save v3 com valores padrão, permitindo
abrir saves anteriores sem conversão destrutiva.

## Repositórios consultados

A separação de estado segue o padrão já adotado da máquina de estados e a
modelagem de instâncias inspirada por Tuxemon. Não foi adicionada biblioteca de
estado, pois este ciclo continua pequeno e testável.

## Limitações

- monstros escolhem o alvo apenas por proximidade;
- Folium não possui defesa ou resistência elemental;
- não há item para despertar imediatamente;
- somente Folium pode ocupar o papel de companheiro ativo;
- efeitos visuais e sonoros de desmaio ainda são provisórios.
