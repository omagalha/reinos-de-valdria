# Passo a passo em casa

## 1. Baixar e extrair

1. Baixe o ZIP entregue no chat.
2. Clique com o botão direito no ZIP.
3. Escolha **Extrair tudo**.
4. Mova a pasta extraída para um lugar fácil, como \`Documentos/Jogos/Reinos-de-Valdria\`.

Não abra nem edite os arquivos diretamente dentro do ZIP.

## 2. Instalar o necessário

### Obrigatório

- [Visual Studio Code](https://code.visualstudio.com/).

### Recomendado para a v4.18 completa

- [Node.js LTS](https://nodejs.org/) versão 20.19 ou superior.

O VS Code edita o projeto; o Node instala Phaser, TypeScript e as ferramentas de teste. Se você quiser apenas abrir o jogo atual, pode usar a extensão Live Server sem Node.

## 3. Abrir no VS Code

1. Abra o VS Code.
2. Vá em **Arquivo → Abrir Pasta**.
3. Selecione a pasta local do projeto \`reinos-de-valdria\`.
4. Confirme que \`package.json\`, \`index.html\`, \`modern.html\`, \`public\` e \`src\` aparecem na lateral.
5. Se o VS Code perguntar se você confia nos autores da pasta, confirme apenas se o ZIP veio deste chat e não foi alterado por terceiros.

## 4. Iniciar

### Opção mais simples no Windows

1. Feche apenas o terminal antigo, se houver.
2. Dê dois cliques em \`INICIAR_JOGO.bat\` para a aventura atual ou em \`INICIAR_LAB_V418.bat\` para abrir o combate Phaser.
3. Na primeira execução, espere a instalação dos pacotes terminar.
4. O navegador abrirá automaticamente.
5. Deixe a janela preta do terminal aberta enquanto estiver jogando ou editando.

### Pelo terminal do VS Code

Abra **Terminal → Novo Terminal** e execute:

\`\`\`bash
npm install
npm run dev
\`\`\`

Clique no endereço exibido no terminal, normalmente \`http://localhost:5173/\`.

## 5. Abrir cada versão

- aventura completa atual: \`http://localhost:5173/\`;
- combate básico Phaser v4.18: \`http://localhost:5173/modern.html\`.

No Phaser, use WASD/setas, toque no destino ou arraste o controle virtual. Use \`E\`, espaço ou \`AÇÃO\` perto de um marcador.

## 6. Fazer sua primeira alteração segura

Uma boa primeira edição é trocar a descrição de um bioma:

1. abra \`src/game/data/catalogs.json\`;
2. altere somente o campo \`description\`;
3. salve com Ctrl+S;
4. volte ao navegador;
5. rode \`npm run check\` no terminal antes de guardar a versão.

Para mexer na aventura atual, use os arquivos numerados em \`public/game\`. Não copie novas mecânicas de volta para um HTML único.

## 7. Testar antes de guardar

No terminal:

\`\`\`bash
npm run check
\`\`\`

O resultado correto termina com a build criada e sem linhas vermelhas. Esse comando confirma:

- paridade com o jogo enviado;
- início, movimento diagonal e save da aventura atual;
- catálogos e referências cruzadas;
- ponte entre os catálogos e o jogo Canvas;
- progressão da aldeia;
- migração do save antigo;
- TypeScript;
- 86 links únicos;
- arquivos e licenças dos assets;
- build de produção.

## 8. Encerrar

1. volte ao terminal que executa o Vite;
2. pressione Ctrl+C;
3. responda \`S\` se o Windows pedir confirmação;
4. feche o VS Code.

O save do jogo fica no perfil do navegador. Usar outro navegador, outra porta ou apagar dados do site pode fazer o save parecer ausente.

## Se algo der errado

### “node não foi encontrado”

Instale o Node.js LTS, reinicie o computador e execute \`INICIAR_JOGO.bat\` novamente.

### A página abriu em branco

Confirme que iniciou com \`npm run dev\`. A página \`modern.html\` não deve ser aberta dando dois cliques no arquivo.

### Um pacote não instalou

Confirme a internet, feche o terminal e execute \`npm install\` novamente. Não baixe DLLs ou instaladores aleatórios.

### O jogo atual parou depois de uma edição

Execute \`npm run test:parity\`. O HTML original continua em \`legacy/reinos_de_valdria_v411_original.html\` para comparação, mas não sobrescreva seus arquivos sem antes guardar uma cópia.

### Quero instalar os 86 repositórios

Não faça isso. Abra \`docs/matriz-de-adocao-dos-86-repositorios.md\`: cada projeto tem um destino. Alguns são engines alternativas, servidores, ferramentas externas ou apenas referências com restrição de licença.
