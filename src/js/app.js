import { buildCatalog } from "./catalog.js";
import { INVENTORY } from "./inventory.generated.js";

/**
 * Punto de entrada de la web: construye el DOM a partir del catálogo
 * (niveles, unidades y materiales) y gestiona el panel lateral.
 * No se inyecta HTML: todo el DOM se crea con createElement.
 */

const catalog = buildCatalog(INVENTORY);

const DESKTOP_QUERY = "(min-width: 60rem)";
const desktopMq = window.matchMedia(DESKTOP_QUERY);

/**
 * Crea un elemento del DOM con atributos y, opcionalmente, texto.
 * @param {string} tagName
 * @param {Record<string, string>} attributes
 * @param {Element[]} children
 * @returns {HTMLElement}
 */
function createElement(tagName, attributes = {}, children = []) {
  const element = document.createElement(tagName);
  for (const [key, value] of Object.entries(attributes)) {
    if (key === "class") {
      element.className = value;
    } else if (key === "text") {
      element.textContent = value;
    } else {
      element.setAttribute(key, value);
    }
  }
  for (const child of children) {
    element.append(child);
  }
  return element;
}

/** Icono Material Symbols reutilizable. */
function createIcon(name) {
  return createElement("span", {
    class: "material-symbols-outlined",
    "aria-hidden": "true",
    text: name,
  });
}

/** Enlace de descarga (PDF) con icono. */
function createDownloadLink(href, label, className) {
  const link = createElement("a", {
    class: className,
    href,
    target: "_blank",
    rel: "noopener",
  });
  link.append(createElement("span", { text: label }), createIcon("download"));
  return link;
} /**
 * Rellena el panel lateral con el árbol completo: niveles → unidades →
 * ejercicios, todos desplegados. Devuelve el mapa id → enlace para el
 * scrollspy (niveles y unidades; los ejercicios abren el PDF).
 */
function renderSidebar() {
  const sidebarLevels = document.getElementById("sidebar-levels");
  const navLinks = new Map();

  for (const level of catalog.levels) {
    const levelId = `basic-${level.number}`;
    const levelItem = createElement("li");
    const levelLink = createElement("a", {
      class: "sidebar__link",
      href: `#${levelId}`,
      text: `${String(level.number).padStart(2, "0")} · ${level.label}`,
    });
    levelItem.append(levelLink);
    navLinks.set(levelId, levelLink);

    if (level.units.length > 0) {
      const unitList = createElement("ul", { class: "sidebar__units" });
      for (const unit of level.units) {
        const unitId = `basic-${level.number}-unit-${unit.number}`;
        const unitItem = createElement("li");
        const unitLink = createElement("a", {
          class: "sidebar__unit-link",
          href: `#${unitId}`,
          text: `unitat ${unit.number}`,
        });
        unitItem.append(unitLink);
        navLinks.set(unitId, unitLink);

        if (unit.exercises.length > 0) {
          const exerciseList = createElement("ul", { class: "sidebar__exercises" });
          for (const exercise of unit.exercises) {
            exerciseList.append(
              createElement("li", {}, [
                createElement("a", {
                  class: "sidebar__exercise-link",
                  href: exercise.file,
                  target: "_blank",
                  rel: "noopener",
                  text: `exercici ${exercise.number}`,
                }),
              ]),
            );
          }
          unitItem.append(exerciseList);
        }

        unitList.append(unitItem);
      }
      levelItem.append(unitList);
    }

    sidebarLevels.append(levelItem);
  }

  const totalFiles = INVENTORY.length;
  document.getElementById("sidebar-meta").textContent =
    `${catalog.totals.levels} nivells · ${totalFiles} fitxers`;

  return navLinks;
}

/** Rellena el resumen del catálogo (placa y estadísticas). */
function renderSummary() {
  document.getElementById("plate-number").textContent = String(catalog.totals.exercises);

  const statsGrid = document.getElementById("stats");
  const stats = [
    { label: "nivells", value: catalog.totals.levels },
    { label: "unitats", value: catalog.totals.units },
    { label: "fitxers", value: INVENTORY.length },
    { label: "materials", value: catalog.totals.materials },
  ];

  for (const stat of stats) {
    const group = createElement("div");
    group.append(
      createElement("dt", { text: stat.label }),
      createElement("dd", { text: String(stat.value) }),
    );
    statsGrid.append(group);
  }
}

/** Construye las secciones de nivel con sus unidades y materiales. */
function renderLevels() {
  const catalogContainer = document.getElementById("catalog");

  for (const level of catalog.levels) {
    const section = createElement("section", {
      class: "level",
      id: `basic-${level.number}`,
    });

    const head = createElement("header", { class: "level__head" });
    head.append(
      createElement("p", {
        class: "level__meta",
        text: `nivell ${level.number} · curs de català`,
      }),
      createElement("h2", { class: "level__title", text: level.label }),
    );

    const exercisesCount = level.units.reduce((sum, unit) => sum + unit.exercises.length, 0);
    const specItems = [];
    if (level.units.length > 0) specItems.push(["unitats", level.units.length]);
    if (exercisesCount > 0) specItems.push(["exercicis", exercisesCount]);
    if (level.materials.length > 0) specItems.push(["materials", level.materials.length]);

    const spec = createElement("dl", { class: "level__spec" });
    for (const [label, value] of specItems) {
      const group = createElement("div");
      group.append(
        createElement("dt", { text: label }),
        createElement("dd", { text: String(value) }),
      );
      spec.append(group);
    }
    head.append(spec);
    section.append(head);

    if (level.units.length > 0) {
      const grid = createElement("div", { class: "units-grid" });
      for (const unit of level.units) {
        const article = createElement("article", {
          class: "unit",
          id: `basic-${level.number}-unit-${unit.number}`,
        });

        const unitHead = createElement("div", { class: "unit__head" });
        unitHead.append(
          createElement("h3", {
            class: "unit__title",
            text: `unitat ${unit.number}`,
          }),
          createElement("span", {
            class: "unit__count",
            text: `${unit.exercises.length} exercicis`,
          }),
        );

        const exerciseList = createElement("ol", { class: "unit__exercises" });
        for (const exercise of unit.exercises) {
          const item = createElement("li");
          item.append(
            createDownloadLink(exercise.file, exercise.label.toLowerCase(), "exercise-link"),
          );
          exerciseList.append(item);
        }

        article.append(unitHead, exerciseList);
        grid.append(article);
      }
      section.append(grid);
    }

    if (level.materials.length > 0) {
      const materials = createElement("div", { class: "level__materials" });
      materials.append(
        createElement("h3", {
          class: "level__materials-title",
          text: "materials del nivell",
        }),
      );
      const list = createElement("ul", { class: "materials-list" });
      for (const material of level.materials) {
        list.append(
          createElement("li", {}, [
            createDownloadLink(material.file, material.label, "material-link"),
          ]),
        );
      }
      materials.append(list);
      section.append(materials);
    }

    catalogContainer.append(section);
  }
}

/** Gestiona el panel lateral como drawer en móvil y fijo en escritorio. */
function initSidebarBehavior() {
  const sidebar = document.getElementById("sidebar");
  const scrim = document.getElementById("scrim");
  const toggle = document.getElementById("sidebar-toggle");
  const closeButton = document.getElementById("sidebar-close");

  function isDesktop() {
    return desktopMq.matches;
  }

  function setSidebarOpen(open) {
    const shouldOpen = open && !isDesktop();
    sidebar.classList.toggle("is-open", shouldOpen);
    toggle.setAttribute("aria-expanded", String(shouldOpen));

    if (shouldOpen) {
      scrim.hidden = false;
      sidebar.inert = false;
      sidebar.setAttribute("aria-hidden", "false");
      sidebar.querySelector("a")?.focus();
    } else {
      scrim.hidden = true;
      sidebar.inert = !isDesktop();
      sidebar.setAttribute("aria-hidden", String(!isDesktop()));
    }
  }

  function applyDesktopState() {
    // En escritorio el panel siempre está visible; se limpia el estado del drawer.
    sidebar.classList.remove("is-open");
    sidebar.inert = false;
    sidebar.setAttribute("aria-hidden", "false");
    toggle.setAttribute("aria-expanded", "false");
    scrim.hidden = true;
  }

  toggle.addEventListener("click", () => {
    setSidebarOpen(!sidebar.classList.contains("is-open"));
  });
  closeButton.addEventListener("click", () => setSidebarOpen(false));
  scrim.addEventListener("click", () => setSidebarOpen(false));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setSidebarOpen(false);
  });

  // Al navegar con un enlace del panel, se cierra el drawer en móvil.
  sidebar.addEventListener("click", (event) => {
    if (event.target.closest("a")) setSidebarOpen(false);
  });

  desktopMq.addEventListener("change", () => {
    if (isDesktop()) applyDesktopState();
  });

  if (isDesktop()) {
    applyDesktopState();
  } else {
    setSidebarOpen(false);
  }
}

/**
 * Sincroniza el scroll con el panel: marca como activo el nivel o la unidad
 * cuya cabecera esté más arriba de la línea de referencia, y también el nivel
 * padre cuando una de sus unidades es la activa. Se recalcula por posición en
 * cada frame (no por IntersectionObserver) para no saltarse secciones en
 * scrolls rápidos.
 */
function initScrollSpy(navLinks) {
  const sections = [...document.querySelectorAll("#catalog section.level, #catalog article.unit")];
  const allLinks = [...navLinks.values()];
  let ticking = false;

  function updateActive() {
    ticking = false;
    const referenceLine = window.innerHeight * 0.35;
    let currentId = null;

    for (const section of sections) {
      if (section.getBoundingClientRect().top <= referenceLine) {
        currentId = section.id;
      } else {
        break;
      }
    }

    for (const [linkId, link] of navLinks) {
      const isSelf = linkId === currentId;
      // Una unidad activa mantiene activo el enlace de su nivel.
      const isParentOfActive = currentId !== null && currentId.startsWith(`${linkId}-unit`);
      link.classList.toggle("is-active", isSelf || isParentOfActive);
    }
  }

  function requestUpdate() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateActive);
    }
  }

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate, { passive: true });
  window.addEventListener("load", requestUpdate);
  requestUpdate();

  // Limpieza de referencias muertas (no hay teardown real en esta web).
  return allLinks;
}

const navLinks = renderSidebar();
renderSummary();
renderLevels();
initSidebarBehavior();
initScrollSpy(navLinks);
