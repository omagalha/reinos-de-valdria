# Gerenciamento de equipe — v4.28

A v4.28 acrescenta uma tela própria para consultar e selecionar os Guardiões
sem depender da troca circular.

## Controles

- `T`: abre ou fecha o painel;
- `EQUIPE`: abre o painel em telas touch;
- clique ou toque em um cartão desperto para ativar o membro;
- `FECHAR`: retorna à exploração.

O mundo fica pausado enquanto o painel está aberto. Cada cartão mostra espécie,
elemento, nível, experiência, HP e estado. Um membro desmaiado continua visível,
com seu tempo de recuperação, mas não pode ser ativado.

## Persistência

A seleção usa o mesmo `activeGuardianId` da v4.27 e solicita gravação imediata.
Nenhum campo novo foi exigido no save v3, mantendo a compatibilidade.

## Limitações

- máximo visual atual de seis membros;
- ainda não há ordenação, apelidos ou dispensa;
- a silhueta do companheiro no mundo continua provisória;
- jogos novos encontram apenas Folium até os próximos biomas.
