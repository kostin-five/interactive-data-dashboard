import "./style.css";
import { renderLayout } from "./ui/layout.js";
import { createDashboardStore } from "./core/store.js";
import { deriveView } from "./core/derive.js";

import { readFileAsText } from "./features/parser/fileReader.js";
import { parseDatasetFromText } from "./features/parser/parser.js";

import { renderControls } from "./features/controls/renderControls.js";
import { renderTable } from "./features/table/renderTable.js";
import { renderPagination } from "./features/pagination/renderPagination.js";
import { renderStats } from "./features/stats/renderStats.js";
import { renderChart } from "./features/chart/renderChart.js";

const { store, actions } = createDashboardStore();
const ui = renderLayout(document.querySelector("#app"));

store.subscribe(renderApp);
renderApp(store.getState());

wireEvents();

function renderApp(state) {
  const view = deriveView(state);

  ui.sourceMeta.textContent =
    state.status === "ready" && state.sourceName
      ? `Источник: ${state.sourceName} • строк: ${view.totalRows}`
      : "";

  renderControls(ui.controls, { state, view });
  renderTable(ui.tableRoot, { state, view });
  renderPagination(ui.paginationRoot, { state, view });
  renderStats(ui.statsRoot, { state, view });
  renderChart(ui.chartRoot, { state, view });

  renderAlert(ui.alert, state);
}

function renderAlert(alertEl, state) {
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

async function handleFile(file) {
  try {
    actions.setStatus("loading");
    const text = await readFileAsText(file);
    const { rows, columns } = parseDatasetFromText({
      text,
      fileName: file.name,
    });
    actions.setDataset({ rows, columns, sourceName: file.name });
  } catch (e) {
    actions.setStatus(
      "error",
      e instanceof Error ? e.message : "Неизвестная ошибка"
    );
  }
}

function wireEvents() {
  // input
  ui.fileInput.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = ""; // чтобы можно было выбрать тот же файл повторно
  });

  // dropzone click/keyboard → открыть file picker
  ui.dropzone.addEventListener("click", () => ui.fileInput.click());
  ui.dropzone.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      ui.fileInput.click();
    }
  });

  // drag&drop
  ui.dropzone.addEventListener("dragover", (e) => {
    e.preventDefault(); // нужно, иначе drop может не сработать
    ui.dropzone.classList.add("isOver");
  });

  ui.dropzone.addEventListener("dragleave", () =>
    ui.dropzone.classList.remove("isOver")
  );

  ui.dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    ui.dropzone.classList.remove("isOver");
    const file = e.dataTransfer?.files?.[0];
    if (file) handleFile(file);
  });

  // controls + table + pagination (event delegation)
  ui.appEl.addEventListener("input", onUiInput);
  ui.appEl.addEventListener("change", onUiChange);
  ui.appEl.addEventListener("click", onUiClick);
}

function onUiInput(e) {
  const el = e.target;
  if (!(el instanceof HTMLElement)) return;

  const action = el.getAttribute("data-action");
  if (action === "search") actions.setSearch(el.value);
  if (action === "filter-query") actions.setFilterQuery(el.value);
}

function onUiChange(e) {
  const el = e.target;
  if (!(el instanceof HTMLElement)) return;

  const action = el.getAttribute("data-action");
  if (action === "sort-key") actions.setSortKey(el.value);
  if (action === "sort-dir") actions.setSortDir(el.value);
  if (action === "filter-column") actions.setFilterColumn(el.value);
  if (action === "page-size") actions.setPageSize(el.value);
  if (action === "stats-column") actions.setStatsColumn(el.value);
  if (action === "chart-x") actions.setChartX(el.value);
  if (action === "chart-y") actions.setChartY(el.value);
}

function onUiClick(e) {
  const el =
    e.target instanceof HTMLElement ? e.target.closest("[data-action]") : null;
  if (!el) return;

  const action = el.getAttribute("data-action");
  if (action === "reset-controls") actions.resetControls();
  if (action === "sort" && el.getAttribute("data-key"))
    actions.setSort(el.getAttribute("data-key"));

  if (action === "page") actions.setPage(el.getAttribute("data-page"));
  if (action === "page-prev") actions.setPage(store.getState().page - 1);
  if (action === "page-next") actions.setPage(store.getState().page + 1);

  if (action === "load-demo") loadDemo();
}

// demo fetch (позже добавим файлы)
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
    actions.setDataset({ rows, columns, sourceName: "demo/transactions.csv" });
  } catch (e) {
    actions.setStatus(
      "error",
      e instanceof Error ? e.message : "Неизвестная ошибка"
    );
  }
}
