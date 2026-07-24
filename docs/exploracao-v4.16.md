# Exploração Phaser — v4.16

## Toque e A*

Um toque transforma a posição do jogador e o destino em células do mapa. O A*
usa oito direções, consulta a layer \`collision\` e não atravessa diagonalmente
quando as duas células laterais estão bloqueadas. Teclado ou controle virtual
cancelam o caminho atual e assumem o movimento imediatamente.

## Minimap

O minimapa apresenta estradas, água e obstáculos, além da posição do jogador e
do retângulo visível pela câmera. Ele é derivado das mesmas layers do TMJ.

## Interações provisórias

Perto de NPCs, baús, santuários ou portais, a interface apresenta uma ação.
Ela pode ser ativada com \`E\`, espaço ou o botão mobile \`AÇÃO\`.

Nesta versão, as respostas são locais e provisórias:

- NPC apresenta uma fala curta;
- baú pode ser aberto uma vez durante a sessão;
- santuário confirma o ponto;
- portal informa que a região de destino ainda não foi migrada.

## Limitações

- o caminho não é recalculado enquanto o jogador está em movimento;
- interações ainda não alteram missões, inventário ou save;
- não há combate nem vínculo no Phaser;
- testes cobrem regras puras, mas ainda não simulam navegador ou aparelho real.
