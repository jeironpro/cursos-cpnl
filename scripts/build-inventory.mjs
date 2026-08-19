import { readdirSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

/**
 * Recorre cpnl/ y genera src/js/inventory.generated.js con la lista de rutas
 * de los PDFs. El fichero generado se commitea y lo consume la web.
 * Uso: node scripts/build-inventory.mjs
 */
const PROJECT_ROOT = process.cwd();
const SOURCE_DIR = "cpnl";
const OUTPUT_FILE = "src/js/inventory.generated.js";

/**
 * Devuelve las rutas relativas de todos los PDF bajo un directorio.
 * @param {string} dir Directorio a recorrer
 * @returns {string[]}
 */
function collectPdfs(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectPdfs(fullPath));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".pdf")) {
      files.push(fullPath);
    }
  }
  return files;
}

const pdfs = collectPdfs(join(PROJECT_ROOT, SOURCE_DIR))
  .map((filePath) => relative(PROJECT_ROOT, filePath).replaceAll("\\", "/"))
  .sort();

const header = "// Generado por scripts/build-inventory.mjs — no editar a mano.\n";
const body = `${header}// Lista de rutas de los PDF presentes en ${SOURCE_DIR}/.\nexport const INVENTORY = ${JSON.stringify(pdfs, null, 2)};\n`;

writeFileSync(join(PROJECT_ROOT, OUTPUT_FILE), body);
console.log(`Inventario generado: ${pdfs.length} PDFs → ${OUTPUT_FILE}`);
