# Save persistente Phaser — v4.25

O laboratório Phaser agora usa o `SaveRepository` com Dexie/IndexedDB que já
existia na fundação.

## Fluxo de abertura

1. procura o slot `principal` do save v3;
2. se não existir, procura o save Canvas v2 no `localStorage`;
3. migra e valida o v2 sem removê-lo ou alterá-lo;
4. se não houver save, cria um novo;
5. somente depois abre o menu.

## Dados persistidos

- classe, nível, XP, HP e mana;
- posição nos Campos de Valdria;
- materiais e Núcleos de Essência;
- vínculo, HP, nível e XP de Folium;
- Guardião ativo.

O autosave ocorre a cada cinco segundos, ao sair do mapa e imediatamente após
um vínculo. O HUD mostra `Save v3: salvo`, `salvando` ou `erro`.

Missões, aldeia, configurações, flags e Guardiões ainda não migrados são
preservados pela mesclagem, mesmo sem serem editados pelo laboratório.

## Repositórios consultados

Dexie continua como solução oficial da matriz. Zod valida todos os dados antes
da gravação. LocalForage e `idb` não foram adicionados, pois criariam uma segunda
camada de persistência sem benefício para o projeto.

## Limitações

- somente Campos de Valdria pode restaurar posição;
- apenas Folium é instanciado como companheiro no Phaser;
- monstros derrotados e seus timers de respawn ainda não são persistidos;
- baús e interações provisórias ainda não alteram o save;
- ainda não existe tela para escolher, apagar ou exportar slots.
