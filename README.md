# cursos-cpnl

## 📌 Descripción

Web estática con los materiales de los cursos de catalán (CPNL) para los
niveles **bàsic 1**, **bàsic 2** y **bàsic 3**: ejercicios por unidades,
cuadernos y audios, organizados en un catálogo con panel lateral izquierdo.

El contenido vive en `cpnl/` (PDFs originales). La web se genera a partir de un
inventario de esos ficheros: algunos materiales se mantienen en el repositorio
pero no se muestran en la web (no se enlazan desde la interfaz).

## 🚀 Puesta en marcha

La web es HTML/CSS/JS vanilla servida estáticamente desde la raíz del
repositorio. No requiere build; solo un servidor estático (los módulos ES
necesitan HTTP, no funcionan abriendo `index.html` con `file://`).

```bash
# 1. Dependencias de desarrollo (lint, formato, tests)
npm install

# 2. Servir la web (cualquier servidor estático vale)
python3 -m http.server 8000
# o: npx serve .
```

Abre <http://localhost:8000>.

## 🧰 Scripts

| Script                             | Descripción                                            |
| ---------------------------------- | ------------------------------------------------------ |
| `npm run lint`                     | ESLint sobre `src/` y `scripts/`                       |
| `npm run format`                   | Prettier (escribe)                                     |
| `npm run format:check`             | Prettier (solo comprueba)                              |
| `npm test`                         | Tests Vitest de la lógica del catálogo                 |
| `node scripts/build-inventory.mjs` | Regenera `src/js/inventory.generated.js` desde `cpnl/` |

## 📁 Estructura

```
cpnl/                      # Materiales PDF (llegan al remoto tal cual)
├── basic_1_a/             # Nivel bàsic 1 (unitats + materiales)
├── basic_2_b/             # Nivel bàsic 2
└── basic_3_a/             # Nivel bàsic 3
docs/style-guide.md        # Libro de estilo (dicresoft)
src/js/catalog.js          # Lógica pura del catálogo + lista de ficheros ocultos
src/js/inventory.generated.js  # Inventario de PDFs (generado)
src/js/app.js              # Render de la web y panel lateral
src/test/catalog.test.js   # Tests del catálogo
tokens.css                 # Tokens de diseño (skill hallmark)
styles.css                 # Estilos (mobile-first, responsive)
index.html                 # Estructura semántica de la página
```

## 🎨 Diseño

El diseño final usa la skill **hallmark** a partir del ADN de la página de
referencia <https://www.usehallmark.com/examples/grid-01/> (macrostructure
_Catalogue_, voz _poster_: retícula de 12 columnas, display Archivo 800 en
minúsculas, celdas con hairline y una única placa de acento), adaptada con
**panel lateral izquierdo** (navegación por niveles y unidades; drawer en
móvil) y acentos de la senyera. 100 % responsive (320 / 375 / 414 / 768 px sin
scroll horizontal).

## 📜 Licencia

Este proyecto está bajo la licencia **MIT**.
Consulta el archivo [LICENSE](LICENSE) para más detalles.
