# Instruções para o Claude

## Fluxo de entrega

Sempre, ao terminar uma mudança:

1. Faça commit e push para a branch de trabalho.
2. Abra um pull request para a `main`.
3. Espere o CI (workflow `tests.yml`, job `smoke`) terminar. Se falhar, corrija e envie de novo até passar.
4. Com o CI verde, faça o merge do pull request na `main` sem pedir confirmação. O merge na `main` publica o site (`pages.yml`).

Se o pull request anterior da branch já foi mergeado, recomece a branch a partir da `main` atual antes de novas mudanças.

## Testes locais

```
npm install --no-save playwright
python3 -m http.server 8765 &
node tests/run.js
```

Não deixe `node_modules/` no repositório.

## Material do Mestre (cofre)

Tudo que é só do Mestre (os módulos `gm-flavour`, `gm-twists`, `gm-tools`, `gm-villain-data` e `gm-bullpen`) fica cifrado em `js/gm-vault.js`; não existe arquivo em texto puro em `js/`. Os originais ficam em `gm/src/` (ignorado pelo git; nunca faça commit de `gm/`).

- Para editar: `GM_PASSWORD='…' node tools/gm-unseal.js` (escreve `gm/src/*.js`), edite e rode `GM_PASSWORD='…' node tools/gm-seal.js`. Faça commit só do `js/gm-vault.js` novo.
- A senha nunca vai para arquivos, commits ou PRs. Peça ao usuário se precisar dela.
- Os testes do Escudo e da Oficina de Antagonista rodam com `GM_PASSWORD` definido (o CI usa o segredo do repositório).
