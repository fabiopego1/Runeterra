# Runeterra — Champion Forge

A fan-made tabletop RPG set in **Runeterra** (League of Legends), using the
**Sentinel Comics: The Roleplaying Game** (SCRPG) rules as its engine.

## Part 1: Character creation (web page)

Open `index.html` in a browser. There's no build step and nothing to install.

### Hosting
`.github/workflows/pages.yml` publishes the site to GitHub Pages on every push to `main` (only the web files, not the rulebook PDF).
One-time setup: **Settings → Pages → Build and deployment → Source: GitHub Actions**. The site is then at `https://fabiopego1.github.io/Runeterra/`.

The builder walks through the rulebook's hero-creation chapter (ch. 3), re-skinned for Runeterra:

| Runeterra step | Sentinels step |
|---|---|
| Homeland (region; flavour only) | — |
| Origin | Background |
| Source of Power | Power Source |
| Path | Archetype |
| Temperament | Personality |
| Ultimates | Red Abilities |
| Twist of Fate | Retcon |
| Health | Health |
| Legend | Finishing Touches |

* **Guided** (roll dice) or **Constructed** (choose freely) methods, with one re-roll per step.
* Every Runeterra name, die, ability keyword and principle has a **hover** that explains what it means in the Sentinels rules.
* Handles dice assignment (including the "I've Already Got That" rule), ability choices, principles, the advanced Divided/Modular Paths, minion forms, Health ranges and retcons.
* Live champion summary and JSON export/import. Progress is saved in your browser.
* **Hero sheet** laid out like the official two-page *Form Fillable Hero Sheet*: Player, physical attributes, portrait, Characteristics, principles with twists, hero points & rewards, Back Issues, Collections, Powers/Qualities, status dice, Health range + current Health, abilities by zone with action icons, and Out. Play-tracking boxes can be edited right on the sheet.
* **Export PDF hero sheet** fills in the official form-fillable PDF (`assets/hero-sheet.pdf`) using the bundled [pdf-lib](https://pdf-lib.js.org/) (`js/vendor/`). If the page is opened straight from disk and the browser blocks loading the template, it asks you to pick the blank sheet PDF instead (or serve the folder, e.g. `python3 -m http.server`).

### Files
* `js/data-rules.js`: ability and principle rules text taken from the rulebook.
* `js/data-tables.js`: the Background, Power Source, Archetype, Personality and Red ability tables, with Runeterra names.
* `js/data-lore.js`: Runeterra flavour: trait names, regions, glossary and principle notes.
* `js/app.js`: the builder itself.
* `gm.html`, `js/gm.js`, `js/gm-vault.js`: the password-protected GM Screen (see below).

### GM Screen
`gm.html` is a GM-only page. GitHub Pages has no server that could check a password, so the page content is published **encrypted** (AES-256-GCM, key derived from the password with PBKDF2) and decrypted in the browser only when the right password is typed. The password itself is never stored in the repo.

To change what the GM page shows (or the password):
1. Write the page content as HTML in `gm/content.html` (this file is git-ignored, so your notes stay private).
2. Run `node tools/gm-seal.js`. It asks for the password and rewrites `js/gm-vault.js`.
3. Commit `js/gm-vault.js`.

*Unofficial fan project. Runeterra © Riot Games. SCRPG © Greater Than Games. For personal, non-commercial use.*
