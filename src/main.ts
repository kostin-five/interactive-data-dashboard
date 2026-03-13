import "./style.css";
import { renderLayout } from "./ui/layout";
import { createDashboardStore } from "./core/store";
import { deriveView } from "./core/derive";

import { readFileAsText } from "./features/parser/fileReader";
import { parseDatasetFromText } from "./features/parser/parser";

import { renderControls } from "./features/controls/renderControls";
import { renderTable } from "./features/table/renderTable";
import { renderPagination } from "./features/pagination/renderPagination";
import { renderStats } from "./features/stats/renderStats";
import { renderChart } from "./features/chart/renderChart";

const { store, actions } = createDashboardStore();
const app = document.querySelector("#app") as HTMLElement;
if (!(app instanceof HTMLElement)) {
  throw new Error("Не найден #app");
}

const ui = renderLayout(app);

store.subscribe(renderApp);
renderApp(store.getState());
wireEvents();

function renderApp(state: ReturnType<typeof store.getState>) {
  const view = deriveView(state);

  ui.sourceMeta.textContent =
    state.status === "ready" && state.sourceName
      ? `Источник: ${state.sourceName} • строк: ${view.totalRows}`
      : "";

  renderControls(ui.controls, { state, view });
  renderTable(ui.tableRoot, { state, view });
  renderPagination(ui.paginationRoot, { state, view });
  renderStats(ui.statsRoot, { state, view });
  renderChart(ui.chartRoot, { view });

  renderAlert(ui.alert, state);
}

function renderAlert(
  alertEl: HTMLElement,
  state: ReturnType<typeof store.getState>
) {
  if (state.status === "error") {
    alertEl.textContent = `Ошибка: ${state.errorMessage}`;
    alertEl.style.color = "var(--danger)";
    return;
  }

  if (state.status === "loading") {
    alertEl.textContent = "Загрузка…";
    alertEl.style.color = "var(--muted)";
    return;
  }

  if (state.status === "ready") {
    alertEl.textContent = "Данные загружены.";
    alertEl.style.color = "var(--muted)";
    return;
  }

  alertEl.textContent = "Загрузите CSV или JSON (через кнопку или drag&drop).";
  alertEl.style.color = "var(--muted)";
}

async function handleFile(file: File) {
  try {
    actions.setStatus("loading");

    const text = await readFileAsText(file);
    const { rows, columns } = parseDatasetFromText({
      text,
      fileName: file.name,
    });

    actions.setDataset({
      rows,
      columns,
      sourceName: file.name,
    });
  } catch (e) {
    actions.setStatus(
      "error",
      e instanceof Error ? e.message : "Неизвестная ошибка"
    );
  }
}

function wireEvents() {
  ui.fileInput.addEventListener("change", (e) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];

    if (file) handleFile(file);

    target.value = "";
  });

  ui.dropzone.addEventListener("click", () => ui.fileInput.click());

  ui.dropzone.addEventListener("keydown", (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      ui.fileInput.click();
    }
  });

  ui.dropzone.addEventListener("dragover", (e: DragEvent) => {
    e.preventDefault();
    ui.dropzone.classList.add("isOver");
  });

  ui.dropzone.addEventListener("dragleave", () => {
    ui.dropzone.classList.remove("isOver");
  });

  ui.dropzone.addEventListener("drop", (e: DragEvent) => {
    e.preventDefault();
    ui.dropzone.classList.remove("isOver");

    const file = e.dataTransfer?.files?.[0];
    if (file) handleFile(file);
  });

  ui.appEl.addEventListener("input", onUiInput);
  ui.appEl.addEventListener("change", onUiChange);
  ui.appEl.addEventListener("click", onUiClick);
}

function onUiInput(e: Event) {
  const el = e.target;
  if (!(el instanceof HTMLElement)) return;

  const action = el.getAttribute("data-action");

  if (action === "search" && el instanceof HTMLInputElement) {
    const cursorPos = el.selectionStart ?? el.value.length;
    actions.setSearch(el.value);

    requestAnimationFrame(() => {
      const nextSearch = ui.controls.querySelector<HTMLInputElement>(
        '[data-action="search"]'
      );
      if (nextSearch) {
        nextSearch.focus();
        nextSearch.setSelectionRange(cursorPos, cursorPos);
      }
    });
  }

  if (action === "filter-query" && el instanceof HTMLInputElement) {
    const cursorPos = el.selectionStart ?? el.value.length;
    actions.setFilterQuery(el.value);

    requestAnimationFrame(() => {
      const nextFilter = ui.controls.querySelector<HTMLInputElement>(
        '[data-action="filter-query"]'
      );
      if (nextFilter) {
        nextFilter.focus();
        nextFilter.setSelectionRange(cursorPos, cursorPos);
      }
    });
  }
}

function onUiChange(e: Event) {
  const el = e.target;
  if (!(el instanceof HTMLElement)) return;

  const action = el.getAttribute("data-action");

  if (!(el instanceof HTMLInputElement || el instanceof HTMLSelectElement)) {
    return;
  }

  if (action === "sort-key") actions.setSortKey(el.value);
  if (action === "sort-dir") actions.SetSortDir(el.value as "asc" | "desc");
  if (action === "filter-column") actions.setFilterColumn(el.value);
  if (action === "page-size") actions.setPageSize(Number(el.value));
  if (action === "stats-column") actions.setStatsColumn(el.value);
  if (action === "chart-x") actions.setChartX(el.value);
  if (action === "chart-y") actions.setChartY(el.value);
}

function onUiClick(e: Event) {
  const target = e.target;
  const el =
    target instanceof HTMLElement ? target.closest("[data-action]") : null;

  if (!(el instanceof HTMLElement)) return;

  const action = el.getAttribute("data-action");

  if (action === "reset-controls") actions.resetControls();
  if (action === "sort" && el.getAttribute("data-key")) {
    actions.setSort(el.getAttribute("data-key") || "");
  }

  if (action === "page") {
    actions.setPage(Number(el.getAttribute("data-page")));
  }

  if (action === "page-prev") {
    actions.setPage(store.getState().page - 1);
  }

  if (action === "page-next") {
    actions.setPage(store.getState().page + 1);
  }

  if (action === "load-demo") {
    void loadDemo();
  }
}

async function loadDemo() {
  try {
    actions.setStatus("loading");

    const res = await fetch("/demo/transactions.csv");
    if (!res.ok) throw new Error("Не удалось загрузить demo data");

    const text = await res.text();
    const { rows, columns } = parseDatasetFromText({
      text,
      fileName: "transactions.csv",
    });

    actions.setDataset({
      rows,
      columns,
      sourceName: "demo/transactions.csv",
    });
  } catch (e) {
    actions.setStatus(
      "error",
      e instanceof Error ? e.message : "Неизвестная ошибка"
    );
  }
}
