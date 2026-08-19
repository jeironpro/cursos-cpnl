# Libro de estilo — cursos CPNL

Documento de referencia visual del proyecto (obligatorio según
`GENERALS_RULES.md` de la skill dicresoft). Se aplica a la web estática de
materiales de los cursos de catalán (niveles básico 1, 2 y 3).

El diseño final lo produce la skill **hallmark** a partir del ADN de la página
de referencia <https://www.usehallmark.com/examples/grid-01/> (macrostructure
_Catalogue_, tema _Grid_), adaptada con **panel lateral izquierdo** y acentos
de la senyera. No es una copia: cambian la estructura (sidebar N3), la voz de
etiquetas (mono) y el acento.

## 1. Paleta de colores

Todos los valores se definen como custom properties en `css/tokens.css` y se
referencian con `var(--token)` — nunca valores sueltos en el CSS.

| Token                | Valor (OKLCH)           | Uso previsto                         |
| -------------------- | ----------------------- | ------------------------------------ |
| `--color-paper`      | `oklch(98.5% 0.004 60)` | Superficie base (fondo)              |
| `--color-paper-2`    | `oklch(96% 0.006 60)`   | Superficie elevada (sidebar, celdas) |
| `--color-paper-3`    | `oklch(93% 0.008 60)`   | Superficie pulsada / hover           |
| `--color-ink`        | `oklch(18% 0.012 40)`   | Texto principal                      |
| `--color-muted`      | `oklch(45% 0.014 40)`   | Texto secundario, labels             |
| `--color-rule`       | `oklch(87% 0.008 55)`   | Líneas de la retícula (hairlines)    |
| `--color-accent`     | `oklch(50% 0.21 28)`    | Acento primario (vermell senyera)    |
| `--color-accent-ink` | `var(--color-paper)`    | Texto sobre el acento                |
| `--color-focus`      | `var(--color-accent)`   | Anillo de foco (`:focus-visible`)    |

Reglas: sin `#000` ni `#fff` puros; el acento ocupa ≤ 3 % de la vista; el rojo
se usa para el elemento "placa" del hero, el estado activo del sidebar y los
enlaces; el amarillo solo como marca puntual del nivel activo.

## 2. Tipografía

| Rol          | Familia       | Peso | Tamaño                                | Uso                         |
| ------------ | ------------- | ---- | ------------------------------------- | --------------------------- |
| Display      | Archivo       | 800  | `clamp(2.75rem, 5vw + 1rem, 5.25rem)` | Hero, títulos de sección    |
| Título 2     | Archivo       | 800  | `clamp(2rem, 3vw, 3rem)`              | Título de nivel             |
| Título 3     | Archivo       | 700  | `1.25rem`                             | Título de unidad            |
| Cuerpo       | Archivo       | 400  | `1rem` (mín. 16 px)                   | Texto general               |
| Label / mono | IBM Plex Mono | 500  | `0.75rem`, mayúsculas                 | Etiquetas, índices, figuras |

- Display en minúsculas con `letter-spacing: -0.045em` y `line-height: 0.9`
  (voz _poster_ de la referencia grid-01).
- Labels con `letter-spacing: 0.08em` y `text-transform: uppercase`.
- Números tabulares (`font-variant-numeric: tabular-nums`) en conteos.
- Máximo tres familias: Archivo (display + cuerpo) + IBM Plex Mono (label).
  Sin itálicas en titulares (siempre roman).

## 3. Espaciados y grilla

Escala 4pt por rol (definida en `css/tokens.css`):

| Token                        | Valor     |
| ---------------------------- | --------- |
| `--space-3xs` … `--space-lg` | 2 … 24 px |
| `--space-xl`                 | 40 px     |
| `--space-2xl`                | 64 px     |
| `--space-3xl`                | 96 px     |

Grilla: retícula visible de 12 columnas (hairlines `--color-rule`) en el área
principal, `--shell-max: 1280px`, gutter `clamp(16px, 2.5vw, 32px)`. El panel
lateral es fijo a la izquierda (~ 15 rem) y el contenido principal ocupa el
resto.

Breakpoints (mobile-first, en `rem`):

| Breakpoint | Comportamiento                                                   |
| ---------- | ---------------------------------------------------------------- |
| `< 40rem`  | Sidebar → drawer (botón hamburguesa + overlay), grid a 1 columna |
| `≥ 40rem`  | Grid de ejercicios a 2 columnas                                  |
| `≥ 60rem`  | Sidebar fijo visible, grid de unidades a 2–3 columnas            |
| `≥ 90rem`  | Máximo ancho de la retícula                                      |

## 4. Componentes base

### Enlace de descarga (PDF)

- Texto del fichero en Archivo 400 + icono Material Symbols `download`.
- Estados: default (subrayado hairline, sin caja) · hover (subrayado doble o
  color acento) · focus (`:focus-visible`, anillo 2 px `--color-focus`) ·
  active (`translateY(1px)`) · disabled (opacidad 0.45, sin hover).

### Tarjeta de unidad (celda de retícula)

- Celda con hairline superior, número de unidad en mono y lista de ejercicios.
- Estados: default · hover (papel-3, solo en `(hover: hover)`) · focus visible.

### Panel lateral (navegación)

- Fijo en escritorio; drawer deslizante en móvil con `aria-expanded`, cierre
  con Escape y clic en el overlay. Enlace activo marcado con el acento.
- Estados de los enlaces igual que el enlace de descarga.

### Fila de ficha (spec-sheet)

- Filas `dt`/`dd` con hairline inferior, valores con números tabulares.

## 5. Iconografía

- Iconos **SVG locales** en la carpeta `icons/` (`download.svg`, `menu.svg`,
  `close.svg`, `chevron-down.svg`), referenciados con
  `<svg class="icon"><use href="icons/X.svg#icon"></use></svg>`.
- Trazos con `fill="currentColor"` para heredar el color del enlace (tinta en
  reposo, acento en hover).
- **Prohibido**: emojis como iconos en la UI y en el código; librerías de
  iconos por CDN.

## 6. Accesibilidad y responsive

- Contraste: texto ≥ 4.5:1; foco visible en todos los elementos interactivos.
- Objetivos táctiles ≥ 44 × 44 px en pantallas táctiles.
- `prefers-reduced-motion`: las transiciones colapsan a opacidad ≤ 150 ms.
- Verificación obligatoria a 320 / 375 / 414 / 768 px sin scroll horizontal.
