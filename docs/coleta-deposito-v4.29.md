# Coleta e depósito — v4.29

Os Campos de Valdria agora possuem pontos de Fibra Verde e Madeira Jovem
definidos na object layer `resource_nodes` do TMJ. A interação usa `E`, espaço
ou `AÇÃO`.

Cada ponto informa `itemId`, quantidade e tempo de regeneração. Os materiais
entram no inventário persistente. O objeto `deposito-do-acampamento`, na layer
`village_deposits`, transfere materiais compatíveis para o estoque da aldeia.

## Regras atuais

- arbustos entregam 2 Fibras Verdes e regeneram em 12 segundos;
- galhos entregam 3 Madeiras Jovens e regeneram em 16 segundos;
- o depósito converte Fibra Verde em fibras e Madeira Jovem em madeira;
- itens que não são recursos de construção permanecem no inventário;
- IDs, quantidade e regeneração são validados automaticamente.

## Assets

Os marcadores desta etapa são formas originais geradas pelo Phaser. Assets de
repositórios de referência poderão substituir esses marcadores quando houver
um pacote visual compatível, com autoria, URL e licença registrados.

## Limitações

- o tempo de regeneração ainda pertence à sessão;
- os pontos ainda usam marcadores provisórios;
- pedra e essência virão de regiões e atividades posteriores;
- o depósito ainda não constrói estruturas.
