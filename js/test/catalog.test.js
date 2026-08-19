import { describe, expect, it } from "vitest";
import { buildCatalog, HIDDEN_FILES, LEVELS } from "../catalog.js";
import { INVENTORY } from "../inventory.generated.js";

describe("buildCatalog", () => {
    it("agrupa los ficheros por nivel y por unidad", () => {
        const inventory = [
            "cpnl/basic_1_a/unitat_1_a/basic_1_u1_ex_02.pdf",
            "cpnl/basic_1_a/unitat_1_a/basic_1_u1_ex_03.pdf",
            "cpnl/basic_2_b/audios_basic_2.pdf",
        ];

        const { levels } = buildCatalog(inventory);

        expect(levels).toHaveLength(3);
        const basic1 = levels[0];
        expect(basic1.label).toBe("Bàsic 1");
        expect(basic1.units).toHaveLength(1);
        expect(basic1.units[0].number).toBe(1);
        expect(basic1.units[0].exercises.map((e) => e.number)).toEqual([2, 3]);
        expect(basic1.materials).toHaveLength(0);
        expect(levels[1].materials).toHaveLength(1);
    });

    it("ordena las unidades y los ejercicios por número", () => {
        const inventory = [
            "cpnl/basic_1_a/unitat_3_a/basic_1_u3_ex_05.pdf",
            "cpnl/basic_1_a/unitat_1_a/basic_1_u1_ex_10.pdf",
            "cpnl/basic_1_a/unitat_2_a/basic_1_u2_ex_01.pdf",
        ];

        const { levels } = buildCatalog(inventory);

        expect(levels[0].units.map((u) => u.number)).toEqual([1, 2, 3]);
        expect(levels[0].units[0].exercises[0].label).toBe("Exercici 10");
    });

    it("filtra los ficheros ocultos de cada nivel", () => {
        const inventory = [
            "cpnl/basic_1_a/activitats_basic_1.pdf",
            "cpnl/basic_1_a/quadern_activitats_complet_basic_1.pdf",
            "cpnl/basic_1_a/quadern_escrit_basic_1.pdf",
            "cpnl/basic_1_a/quadern_activitats_basic_1.pdf",
            "cpnl/basic_1_a/unitat_1_a/basic_1_u1_ex_02.pdf",
            "cpnl/basic_3_a/nota_prova_final_A.pdf",
            "cpnl/basic_3_a/tasca_3_A.pdf",
            "cpnl/basic_3_a/audios_basic_3.pdf",
        ];

        const { levels, totals } = buildCatalog(inventory);

        const visibleBasic1 = levels[0].materials.map((m) => m.name);
        expect(visibleBasic1).toEqual(["quadern_activitats_basic_1.pdf"]);
        expect(levels[2].materials.map((m) => m.name)).toEqual(["audios_basic_3.pdf"]);
        expect(totals.materials).toBe(2);
    });

    it("interpreta el número de ejercicio con mayúsculas (U4_Ex_02)", () => {
        const inventory = ["cpnl/basic_1_a/unitat_4_a/basic_1_U4_Ex_02.pdf"];

        const { levels } = buildCatalog(inventory);

        expect(levels[0].units[0].exercises[0]).toMatchObject({
            number: 2,
            label: "Exercici 2",
        });
    });

    it("etiqueta los materiales conocidos y aplica un nombre legible por defecto", () => {
        const inventory = [
            "cpnl/basic_2_b/audios_basic_2.pdf",
            "cpnl/basic_2_b/quadern_escrit_basic_2.pdf",
        ];

        const { levels } = buildCatalog(inventory);

        // quadern_escrit_basic_2.pdf está oculto; solo queda el conocido.
        expect(levels[1].materials.map((m) => m.label)).toEqual(["Àudios"]);
    });

    it("ignora directorios no declarados y rutas sin extensión pdf", () => {
        const inventory = [
            "cpnl/basic_1_a/unitat_8_a/", // unidad vacía (sin ficheros)
            "cpnl/otro_nivel/leeme.txt",
            "cpnl/basic_1_a/unitat_1_a/portada.jpg",
        ];

        const { levels, totals } = buildCatalog(inventory);

        expect(levels[0].units).toHaveLength(0);
        expect(totals).toEqual({ levels: 3, units: 0, exercises: 0, materials: 0 });
    });

    it("devuelve totales a cero con un inventario vacío", () => {
        const { levels, totals } = buildCatalog([]);

        expect(levels).toHaveLength(3);
        expect(totals).toEqual({ levels: 3, units: 0, exercises: 0, materials: 0 });
    });

    it("no crea unidades sin ejercicios ni ficheros duplicados", () => {
        const inventory = [
            "cpnl/basic_1_a/unitat_1_a/basic_1_u1_ex_02.pdf",
            "cpnl/basic_1_a/unitat_1_a/basic_1_u1_ex_02.pdf",
        ];

        const { levels, totals } = buildCatalog(inventory);

        expect(levels[0].units[0].exercises).toHaveLength(1);
        expect(totals.exercises).toBe(1);
    });
});

describe("catálogo real (inventario generado)", () => {
    const { levels, totals } = buildCatalog(INVENTORY);

    it("no expone ningún fichero de la lista de ocultos", () => {
        const visibleFiles = new Set(
            levels.flatMap((level) => [
                ...level.units.flatMap((unit) => unit.exercises.map((e) => e.file)),
                ...level.materials.map((m) => m.file),
            ]),
        );

        for (const [levelDir, files] of Object.entries(HIDDEN_FILES)) {
            for (const file of files) {
                const path = `cpnl/${levelDir}/${file}`;
                expect(visibleFiles.has(path), `${path} no debe mostrarse`).toBe(false);
            }
        }
    });

    it("mantiene los totales esperados del curso", () => {
        expect(LEVELS).toHaveLength(3);
        expect(totals.levels).toBe(3);
        expect(totals.units).toBe(7);
        expect(totals.exercises).toBe(64);
        expect(totals.materials).toBe(3);
        expect(INVENTORY.length).toBe(81);
    });
});
