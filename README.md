# Runeterra · Forja de Campeões

Um RPG de mesa feito por fãs, ambientado em **Runeterra** (League of Legends). Este repositório guarda o site da campanha: a Forja de Campeões (criação de personagem), as páginas de Lore e de Regras e o Escudo do Mestre.

Site publicado: https://fabiopego1.github.io/Runeterra/

## O que tem no site

* **Forja** (`index.html`): cria o campeão em nove capítulos (Terra Natal, Origem, Fonte de Poder, Caminho, Temperamento, Supremas, Reviravolta do Destino, Vida e Lenda).
  * Método **Construído** (você escolhe tudo) ou **Guiado** (rola os dados e escolhe entre o que eles liberam, com uma nova rolagem por capítulo).
  * Todo termo sublinhado explica o que significa ao passar o mouse (ou tocar, no celular).
  * O progresso fica salvo no navegador. O menu **Arquivo** exporta e importa o campeão em `.json`, imprime a ficha e recomeça do zero.
  * **Ficha do campeão** na tela, para imprimir ou em **PDF** vetorial (`js/sheet-pdf.js`, com [pdf-lib](https://pdf-lib.js.org/) e fontkit em `js/vendor/`). Pontos, coleções e Vida atual continuam editáveis em qualquer leitor de PDF.
* **Lore** (`lore.html`): o planeta, a linha do tempo, as regiões e os povos, com espaço para imagens.
* **Regras** (`regras.html`): o resumo para a mesa, em três partes, com busca e glossário de A a Z. Na Forja, a tecla `?` abre essa página.
* **Escudo do Mestre** (`gm.html`): página protegida por senha (veja abaixo).

Não há etapa de build: basta abrir `index.html` no navegador ou servir a pasta com `python3 -m http.server`.

## Arquivos

* `js/app.js`: a Forja.
* `js/data-tables.js`, `js/data-rules.js`, `js/data-lore.js`: tabelas, regras das habilidades e nomes de Runeterra.
* `js/i18n.js` e `js/pt/*`: todos os textos em português.
* `js/lore-page.js`, `js/pt/lore.js`, `js/lore-images.js`: a página de Lore. Para colocar uma imagem, salve o arquivo em `assets/lore/` e registre em `js/lore-images.js` (veja `assets/lore/README.md`).
* `js/rules-page.js`, `js/pt/cheatsheet.js`: a página de Regras.
* `assets/fonts/`: as fontes do site (WOFF2 recortado), servidas pelo próprio site.
* `tests/`: testes automáticos (Playwright) que rodam no GitHub Actions a cada push.

## Publicação

`.github/workflows/pages.yml` publica o site no GitHub Pages a cada push na `main` (só os arquivos do site). Configuração única: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

## Escudo do Mestre

O GitHub Pages não tem servidor para conferir senha, então o conteúdo do Escudo é publicado **criptografado** (AES-256-GCM, chave derivada da senha com PBKDF2) e só é aberto no navegador quando a senha certa é digitada. A senha nunca fica no repositório.

Depois de aberto, o Escudo mostra também o **Tradutor de Sabor** (`js/gm-flavour.js`), com a correspondência entre os nomes do sistema original e os nomes de Runeterra.

Para mudar as notas do Mestre (ou a senha):
1. Escreva o conteúdo em HTML em `gm/content.html` (esse arquivo é ignorado pelo git, então as notas ficam privadas).
2. Rode `node tools/gm-seal.js`. Ele pede a senha e regrava `js/gm-vault.js`.
3. Faça commit de `js/gm-vault.js`.

## Testes

```
npm install --no-save playwright
python3 -m http.server 8765 &
node tests/run.js
```

O teste do Escudo do Mestre só roda se a variável `GM_PASSWORD` estiver definida (no GitHub, como secret do repositório).

*Projeto de fã não oficial. Runeterra e League of Legends são © Riot Games. Uso pessoal e não comercial.*
