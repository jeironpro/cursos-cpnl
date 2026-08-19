# Plan de implementación — web de cursos CPNL

Plan por tarea elaborado según la skill **dicresoft** y su documento `TASK.md`
(flujo por ticket: rama individual → implementación → verificación → commit →
pull request → CI → squash-and-merge).

## Modo de trabajo

- **Sin Jira**: los commits y los títulos de pull request usan el formato
  `<prefijo>/<categoría>: <mensaje>` (p. ej. `feature/diseno: construye la web
  responsive`).
- Mensajes de commit: minúsculas salvo nombres propios, modo imperativo, sin
  punto final.
- Cada tarea vive en su propia rama creada desde `main` y se integra con
  squash-and-merge + borrado de rama (`gh pr merge --squash --delete-branch`).

## Stack

HTML/CSS/JS vanilla en la raíz del repositorio, con tooling npm
(ESLint + Prettier + Husky/lint-staged + Vitest). La carpeta `cpnl/` (81 PDFs)
permanece en la raíz sin mover, de modo que los enlaces relativos
(`cpnl/basic_1_a/...`) funcionan en cualquier servidor estático y los
materiales llegan al remoto tal cual están.

---

## T1 · `docs/plan-implementacion`

- **Rama**: `docs/plan-implementacion`
- **Implementación**: este documento.
- **Verificación**: revisión humana del plan (sin código).
- **Commit**: `docs/plan-implementacion: define el plan por tarea del proyecto`
- **PR**: `docs/plan-implementacion: define el plan por tarea del proyecto`

## T2 · `chore/scaffold`

- **Rama**: `chore/scaffold`
- **Implementación**:
  - `package.json` con scripts estándar (`dev` no aplica en estático;
    `build` no aplica; `lint`, `format`, `format:check`, `test`, `test:watch`).
  - ESLint (config plana `eslint.config.js`, base `@eslint/js` + `globals`) y
    Prettier (`.prettierrc.json`).
  - Husky + lint-staged según `PRECOMMIT.md` (rama HTML/CSS/JS con npm):
    ESLint `--fix` y Prettier `--write` sobre los ficheros staged.
  - `.gitignore` generado a partir de la plantilla `Node.gitignore` oficial de
    GitHub (`GENERALS_RULES.md`). `cpnl/` **no** se ignora (debe llegar al remoto).
  - `.nvmrc` con la versión de Node (24) (`NODEJS_RULES.md`).
  - Workflow de CI `.github/workflows/ci.yml` (lint + format:check + test).
- **Verificación**: `npm run lint` y `npm run format:check` en verde.
- **Commit**: `chore/scaffold: configura tooling de calidad (eslint, prettier, husky, ci)`
- **PR**: `chore/scaffold: configura tooling de calidad (eslint, prettier, husky, ci)`

## T3 · `docs/style-guide`

- **Rama**: `docs/style-guide`
- **Implementación**: `docs/style-guide.md` — libro de estilo obligatorio por
  `GENERALS_RULES.md` **antes** de implementar componentes visuales:
  - Paleta (valores OKLCH y uso: primario, secundario, estados).
  - Tipografía (familias, tamaños, pesos por jerarquía).
  - Espaciados y grilla (escala 4pt, breakpoints).
  - Componentes base (enlaces de descarga, tarjetas de unidad, panel lateral)
    con sus estados.
  - Iconografía: Material Symbols (Google) como estándar, sin emojis en la UI.
- **Verificación**: revisión del documento.
- **Commit**: `docs/style-guide: crea el libro de estilo del proyecto`
- **PR**: `docs/style-guide: crea el libro de estilo del proyecto`

## T4 · `feature/catalogo`

- **Rama**: `feature/catalogo`
- **Implementación**:
  - `scripts/build-inventory.mjs`: recorre `cpnl/` y genera el inventario de
    rutas (`src/js/inventory.generated.js`).
  - `src/js/catalog.js`: lógica pura — agrupa por nivel/unitat, extrae números
    de ejercicio, ordena, y **filtra la lista de ficheros ocultos** definida por
    el usuario (no se muestran en la web pero se mantienen en el remoto).
  - `src/test/catalog.test.js`: tests Vitest de la lógica (agrupación, orden,
    filtrado de ocultos, totales). Cubre casos de éxito y de error.
- **Verificación**: `npm test` en verde.
- **Commit**: `feature/catalogo: genera el inventario y filtra los materiales ocultos`
- **PR**: `feature/catalogo: genera el inventario y filtra los materiales ocultos`

## T5 · `feature/diseno`

- **Rama**: `feature/diseno`
- **Implementación**: la web (diseño final con la skill **hallmark**, adaptando
  la página de referencia <https://www.usehallmark.com/examples/grid-01/> sin
  copiarla, con panel lateral izquierdo):
  - `tokens.css` (tokens de la skill hallmark en la raíz) + `styles.css`
    (stamp de hallmark, mobile-first, `overflow-x: clip`).
  - `index.html` (semántico, `lang="ca"`, a11y) y `src/js/app.js`
    (render del catálogo, panel lateral como drawer en móvil).
  - 100 % responsive: verificado en 320 / 375 / 414 / 768 px sin scroll
    horizontal, affordances de una sola línea, foco visible, `prefers-reduced-motion`.
  - `.hallmark/log.json` en la raíz (memoria de la skill).
  - Actualización del `README.md` (cómo servir la web).
- **Verificación**: `npm test` + `npm run lint` en verde; slop-test de hallmark.
- **Commit**: `feature/diseno: construye la web responsive con panel lateral`
- **PR**: `feature/diseno: construye la web responsive con panel lateral`

## T6 · `chore/cpnl` (contenido)

- **Rama**: `chore/cpnl`
- **Implementación**: incorporar `cpnl/` al repositorio (81 PDFs). Los 14
  ficheros de la lista "no se muestra pero llega al remoto" se mantienen en el
  repositorio; la web simplemente no los enlaza (garantizado por `catalog.js`).
- **Verificación**: `git status` limpio y `npm test` en verde.
- **Commit**: `chore/cpnl: incorpora los materiales pdf del curso`
- **PR**: `chore/cpnl: incorpora los materiales pdf del curso`

### Riesgo conocido del push

Tres ficheros de `basic_1_a` superan los 100 MB (627–713 MB), el límite duro de
GitHub para ficheros normales:

- `cpnl/basic_1_a/activitats_basic_1.pdf` (≈ 691 MB)
- `cpnl/basic_1_a/quadern_activitats_complet_basic_1.pdf` (≈ 713 MB)
- `cpnl/basic_1_a/quadern_escrit_basic_1.pdf` (≈ 627 MB)

Si el push se rechaza, las opciones a proponer al usuario son: (a) Git LFS
(requiere cuota — el plan gratuito es 1 GB), (b) recompresión de los PDF
(ghostscript/qpdf) para dejarlos por debajo del límite, o (c) alojarlos fuera
de GitHub. El resto de ficheros (≈ 90 MB en total) sí pueden subirse como
objetos git normales.

---

## Ciclo por tarea (TASK.md)

1. `git checkout main && git pull && git checkout -b <prefijo>/<categoria>`
2. Implementar.
3. Verificar tests: `npm test` (+ `npm run lint`). Si fallan, corregir y repetir.
4. Commit: `<prefijo>/<categoria>: <mensaje>` (sin punto final).
5. PR contra `main`: `gh pr create --base main --title ... --body ...`.
6. Verificar CI.
7. `gh pr merge --squash --delete-branch`.
