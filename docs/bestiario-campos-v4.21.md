# Bestiário dos Campos — v4.21

Campos de Valdria agora possui três espécies combatíveis:

- **Ratino do Campo**: inimigo inicial ágil e frágil;
- **Javali Musgoso**: territorial, resistente e mais forte;
- **Esporo Errante**: criatura de emboscada com visão mais curta.

Cada objeto da layer `monster_spawns` informa um `catalogId`. A cena usa esse ID
para carregar nome, HP, dano, experiência e drops do `catalogs.json`. Velocidade
e visão das espécies sem equivalente legado são aplicadas pelo adaptador Phaser
de acordo com o comportamento.

As aparências são formas vetoriais provisórias e originais geradas em tempo de
execução. Nenhum asset externo foi adicionado.

## Limitações

- monstros não reaparecem após a derrota;
- comportamentos ainda compartilham a mesma perseguição básica;
- não há colisão entre entidades;
- formas, animações e efeitos sonoros são provisórios;
- progresso de combate ainda não é persistido.
