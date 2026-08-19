# cursos-cpnl

## Descripción

Web estática con los materiales de los cursos de catalán (CPNL) para los
niveles bàsic 1, bàsic 2 y bàsic 3: ejercicios por unidades, cuadernos y
audios, organizados en un catálogo con panel lateral izquierdo.

El contenido vive en `cpnl/` (ficheros PDF). La web se genera a partir de un
inventario de esos ficheros: algunos materiales se mantienen en el repositorio
pero no se muestran en la interfaz (no se enlazan desde la web).

## Puesta en marcha

La web es HTML/CSS/JS vanilla servida estáticamente desde la raíz del
repositorio. No requiere build; solo un servidor estático (los módulos ES
necesitan HTTP, no funcionan abriendo `index.html` con `file://`).

```bash
# Dependencias de desarrollo (lint, formato, tests)
npm install

# Servir la web (cualquier servidor estático vale)
python3 -m http.server 8000
# o: npx serve .
```

Abrir <http://localhost:8000>.

## Scripts

| Script                             | Descripción                                        |
| ---------------------------------- | -------------------------------------------------- |
| `npm run lint`                     | ESLint sobre `js/` y `scripts/`                    |
| `npm run format`                   | Prettier (escribe)                                 |
| `npm run format:check`             | Prettier (solo comprueba)                          |
| `npm test`                         | Tests Vitest de la lógica del catálogo             |
| `node scripts/build-inventory.mjs` | Regenera `js/inventory.generated.js` desde `cpnl/` |

## Estructura

```
cpnl/                         # Materiales PDF (llegan al remoto tal cual)
├── basic_1_a/                # Nivel bàsic 1 (unitats + materials)
├── basic_2_b/                # Nivel bàsic 2
└── basic_3_a/                # Nivel bàsic 3
css/                          # Hojas de estilo
├── tokens.css                # Tokens de diseño (skill hallmark)
└── styles.css                # Estilos (mobile-first, responsive)
js/                           # Módulos de la web
├── app.js                    # Render de la web y panel lateral
├── catalog.js                # Lógica pura del catálogo + ficheros ocultos
├── inventory.generated.js    # Inventario de PDFs (generado)
└── test/catalog.test.js      # Tests del catálogo
icons/                        # Iconos y favicons locales (SVG/PNG)
docs/style-guide.md           # Libro de estilo
index.html                    # Estructura semántica de la página
scripts/build-inventory.mjs   # Genera el inventario desde cpnl/
```

Nota: `cpnl/basic_1_a/_originals/` guarda las copias originales de los PDF
comprimidos para el remoto; está excluido del repositorio vía `.gitignore`.

## Diseño

El diseño final usa la skill hallmark a partir del ADN de la página de
referencia <https://www.usehallmark.com/examples/grid-01/> (macrostructure
_Catalogue_, voz _poster_: retícula de 12 columnas, display Archivo 800 en
minúsculas, celdas con hairline y una única placa de acento), adaptada con
panel lateral izquierdo (navegación por niveles y unidades con acordeones;
drawer en móvil) y acentos de la senyera. 100 % responsive (320 / 375 / 414 /
768 px sin scroll horizontal).

## Licencia

Este proyecto está bajo la licencia MIT.
Consulta el archivo [LICENSE](LICENSE) para más detalles.
