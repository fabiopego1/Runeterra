# Runeterra — Champion Forge

A fan-made tabletop RPG set in **Runeterra** (League of Legends), using the
**Sentinel Comics: The Roleplaying Game** (SCRPG) rules as its engine.

## Part 1: Character creation (web page)

Open `index.html` in a browser. There's no build step and nothing to install. You can also host it on GitHub Pages.

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
* Live champion summary, a printable hero sheet, and JSON export/import. Progress is saved in your browser.

### Files
* `js/data-rules.js`: ability and principle rules text taken from the rulebook.
* `js/data-tables.js`: the Background, Power Source, Archetype, Personality and Red ability tables, with Runeterra names.
* `js/data-lore.js`: Runeterra flavour: trait names, regions, glossary and principle notes.
* `js/app.js`: the builder itself.

*Unofficial fan project. Runeterra © Riot Games. SCRPG © Greater Than Games. For personal, non-commercial use.*
