# Building a Wall · Project wiring diagrams

Foray 160 explores how a project can be assembled from smaller blocks with explicit interfaces. The public entrance is [Building a Wall](https://lawrencerowland.github.io/building_a_wall/); its starting point is the interactive essay [Build a house. Keep the interfaces honest.](https://lawrencerowland.github.io/building_a_wall/apps/wall-roof-wiring-smc/).

The essay uses a small construction example to explore typed inputs and outputs, readiness conditions, reusable modules and computed checks. Its existing route is retained. The [experiment catalogue](https://lawrencerowland.github.io/building_a_wall/app-index.html) keeps all nine experiments reachable, including the eight earlier companion explorations.

## Public enquiry

**Question:** What must each piece of work provide before another can begin, and can those interfaces support understandable, reusable project blocks?

- **Ends:** Make dependencies, hand-offs and readiness conditions visible enough to question, explain and reuse.
- **Ways:** Connect typed interfaces, state the conditions of each process, and compare a module with the work inside it.
- **Means:** Small interactive construction models, wiring diagrams, port tables and computed checks, supported by the mathematical language of composition.

The foray is wider than the first wall-and-roof example. These are exploratory teaching models: checks establish properties only of the represented rules, not engineering safety, schedule completeness or fitness for real delivery. The revision of the featured essay does not imply review of the earlier experiments.

## Project structure

- `index.html` — the focused foray entrance.
- `apps/wall-roof-wiring-smc/index.html` — the current interactive essay, at its existing public route.
- `apps/` — nine experiments, including the earlier wiring, contracts, operad, SysML, cliff-shed and Petri-to-WBS explorations.
- `app-index.csv` and `app-index.html` — the complete experiment catalogue.
- `common.css` — shared typography and base styles.
- `scripts/build-all.js` — builds or copies apps into the generated `docs/` site.

## Design and contribution

Follow `AGENTS.md`. Use the shared stylesheet, responsive layouts and relative asset paths. Keep small datasets embedded and make the assumptions and limits of each model explicit. Preserve existing experiment routes when revising their content.

## Build and deployment

The GitHub Pages workflow in `.github/workflows/deploy.yml` runs `npm ci`, `npm run test:wiring` and `npm run build` on pushes to `main`, then deploys the generated `docs/` directory. Static experiment directories are copied into `docs/apps/`; React apps are built with Vite. The build also copies the root entrance, catalogue, shared stylesheet and preview images.

## Essay checks and provenance

Run `npm run test:wiring` for the 26 model checks, then `npm run build`. The build bundles the maintained `model.mjs` and `app.mjs` into the essay HTML so the interaction also works without a module server. The finite comparison covers 256 fixture assignments for each of two wall implementations; it checks both acceptance and the complete output record. Independent review led to an explicit two-worker gate inside the module, so its requirement survives substitution.

The exact April source is recoverable at commit `cd1547bb8e705ab7a779253e3cbbeb32adc0aaf6`, path `apps/wall-roof-wiring-smc/index.html` (SHA-256 `75a2c54515f71b0f826e2c42ad95c0006fbff6a37f1b2bdc1fe1a830dbf86ef7`). It is retained in history, not as a second live essay. The prior published version differed only in navigation and shared styling.

## License

This project is licensed under the [MIT License](LICENSE).
