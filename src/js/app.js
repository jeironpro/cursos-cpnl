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

const SVG_NS = "http://www.w3.org/2000/svg";

/**
 * Aplica el estado de un acordeón (cabecera + panel + contenido interno).
 * Plegado: el contenido no debe ser enfocable ni anunciado.
 */
function setAccordionState(button, panel, panelInner, expanded) {
  button.setAttribute("aria-expanded", String(expanded));
  panel.classList.toggle("is-collapsed", !expanded);
  panelInner.inert = !expanded;
  panelInner.setAttribute("aria-hidden", String(!expanded));
}

/** Icono SVG local (icons/) reutilizable, coloreable con currentColor. */
function createIcon(name) {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("class", "icon");
  svg.setAttribute("aria-hidden", "true");
  const use = document.createElementNS(SVG_NS, "use");
  use.setAttribute("href", `icons/${name}.svg#icon`);
  svg.append(use);
  return svg;
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
 * Rellena el panel lateral con un menú acordeón: cada nivel es una cabecera
 * desplegable que contiene unidades → ejercicios y sus materiales. Todos los
 * niveles arrancan desplegados. Devuelve el mapa id → elemento (botón de
 * nivel o enlace de unidad) para el scrollspy, y el mapa unidad → nivel para
 * resaltar el nivel padre.
 */
function renderSidebar() {
  const sidebarLevels = document.getElementById("sidebar-levels");
  const navLinks = new Map();
  const parentLevels = new Map();

  for (const level of catalog.levels) {
    const levelId = `basic-${level.number}`;
    const panelId = `panel-${levelId}`;
    const levelItem = createElement("li", { class: "sidebar__level" });

    const accordion = createElement("button", {
      class: "sidebar__accordion",
      type: "button",
      "aria-expanded": "true",
      "aria-controls": panelId,
    });
    accordion.append(
      createElement("span", {
        class: "sidebar__accordion-label",
        text: `${String(level.number).padStart(2, "0")} · ${level.label}`,
      }),
      createIcon("chevron-down"),
    );
    levelItem.append(accordion);
    navLinks.set(levelId, accordion);

    const panel = createElement("div", { class: "sidebar__panel", id: panelId });
    const panelInner = createElement("div", { class: "sidebar__panel-inner" });

    const unitList = createElement("ul", { class: "sidebar__units" });
    for (const unit of level.units) {
      const unitId = `basic-${level.number}-unit-${unit.number}`;
      const unitPanelId = `panel-${unitId}`;
      const unitItem = createElement("li");

      // Acordeón de unidad: pliega/despliega sus ejercicios.
      const unitAccordion = createElement("button", {
        class: "sidebar__unit-accordion",
        type: "button",
        "aria-expanded": "true",
        "aria-controls": unitPanelId,
      });
      unitAccordion.append(
        createElement("span", { text: `unitat ${unit.number}` }),
        createIcon("chevron-down"),
      );
      unitItem.append(unitAccordion);
      navLinks.set(unitId, unitAccordion);
      parentLevels.set(unitId, levelId);

      const unitPanel = createElement("div", {
        class: "sidebar__panel",
        id: unitPanelId,
      });
      const unitPanelInner = createElement("div", { class: "sidebar__panel-inner" });

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
        unitPanelInner.append(exerciseList);
      }

      unitPanel.append(unitPanelInner);
      unitItem.append(unitPanel);
      unitList.append(unitItem);

      unitAccordion.addEventListener("click", () => {
        const isExpanded = unitAccordion.getAttribute("aria-expanded") === "true";
        setAccordionState(unitAccordion, unitPanel, unitPanelInner, !isExpanded);
      });
      // Todos los acordeones arrancan cerrados.
      setAccordionState(unitAccordion, unitPanel, unitPanelInner, false);
    }
    panelInner.append(unitList);

    if (level.materials.length > 0) {
      const materialsList = createElement("ul", { class: "sidebar__materials" });
      for (const material of level.materials) {
        materialsList.append(
          createElement("li", {}, [
            createElement("a", {
              class: "sidebar__material-link",
              href: material.file,
              target: "_blank",
              rel: "noopener",
              text: material.label,
            }),
          ]),
        );
      }
      panelInner.append(materialsList);
    }

    panel.append(panelInner);
    levelItem.append(panel);
    sidebarLevels.append(levelItem);

    accordion.addEventListener("click", () => {
      const isExpanded = accordion.getAttribute("aria-expanded") === "true";
      setAccordionState(accordion, panel, panelInner, !isExpanded);
    });
    // Todos los acordeones arrancan cerrados.
    setAccordionState(accordion, panel, panelInner, false);
  }

  const totalFiles = INVENTORY.length;
  document.getElementById("sidebar-meta").textContent =
    `${catalog.totals.levels} nivells · ${totalFiles} fitxers`;

  return { navLinks, parentLevels };
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
 * scrolls rápidos. La relación unidad → nivel es explícita (mapa), evitando
 * colisiones de prefijo tipo unit-1 / unit-10.
 */
function initScrollSpy({ navLinks, parentLevels }) {
  const sections = [...document.querySelectorAll("#catalog section.level, #catalog article.unit")];
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
      const isParentOfActive = currentId !== null && parentLevels.get(currentId) === linkId;
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
}

const sidebar = renderSidebar();
renderSummary();
renderLevels();
initSidebarBehavior();
initScrollSpy(sidebar);
