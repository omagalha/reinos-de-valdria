# Combate básico Phaser — v4.18

O primeiro corte de combate usa Cavaleiro e Ratino do Campo. Todos os números
compartilhados vêm de \`catalogs.json\` e possuem testes de paridade.

## Controles

- clique ou toque em um Ratino para selecionar;
- aproxime-se até um tile;
- pressione \`F\` ou use \`ATACAR\`;
- o Ratino detecta, aproxima-se e ataca automaticamente.

## Estado provisório

HP, XP, nível e materiais existem somente durante a sessão Phaser. Nenhum dado é
gravado no save v2 ou v3 nesta etapa. Ao desmaiar, o jogador retorna ao spawn com
HP completo.

## Limitações

- apenas Cavaleiro e Ratino;
- sem animações, projéteis, efeitos ou áudio de combate;
- monstros não reaparecem;
- entidades ainda podem se sobrepor;
- drops ainda não entram no inventário persistente;
- Guardiões e vínculo continuam fora desta versão.
