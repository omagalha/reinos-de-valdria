# Folium companheiro — v4.24

Depois de um vínculo bem-sucedido, Folium permanece no mapa como companheiro
ativo.

## Comportamento

- segue o jogador quando fica distante;
- aproxima-se do monstro selecionado;
- ataca automaticamente a curta distância;
- recebe metade da experiência do monstro quando realiza o golpe final;
- sobe de nível pela curva preservada do Canvas;
- aumenta o HP máximo e se cura ao subir de nível;
- usa Raiz Vital automaticamente quando o jogador ou Folium está ferido durante
  um combate.

## Repositórios consultados

Tuxemon continua orientando a separação entre espécie, instância e equipe.
Kaetram e os exemplos de RPG foram consultados como referência de divisão entre
regra e apresentação. A implementação permanece local e testável, sem nova
dependência ou conteúdo externo.

## Limitações

- Folium ainda não recebe ataques dos monstros;
- não há desmaio ou reanimação do companheiro;
- apenas o golpe final concede XP nesta primeira versão;
- não é possível trocar o Guardião ativo;
- vínculo e progressão duram somente a sessão.
