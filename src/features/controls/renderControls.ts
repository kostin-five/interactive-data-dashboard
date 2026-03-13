import type { AppState, DerivedView } from "../../core/types";

function option(value: string, label: string, current: string): string {
  const selected = value === current ? "selected" : "";
  return `<option value="${escapeHtml(value)}" ${selected}>${escapeHtml(
    label
  )}</option>`;
}

function escapeHtml(s: string):string {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function renderControls(root:HTMLElement, { state, view } : {state: AppState; view: DerivedView}): void {
  const colOptions = [""].concat(state.columns);

  const sortKey = state.sortKey;
  const sortDir = state.sortDir;

  const filterCol = state.filterColumn;
  const filterQuery = state.filterQuery;

  const statsCol = view.statsColumn;
  const chartX = view.chartX;
  const chartY = view.chartY;

  root.innerHTML = `
    <div class="controls">
      <div class="controlsTitle">Управление</div>

      <label class="field">
        <div class="fieldLabel">Поиск (по всем колонкам)</div>
        <input class="input" data-action="search" type="search" value="${escapeHtml(
          state.search
        )}" placeholder="например: paid, 2025-01, Berlin…" />
      </label>

      <div class="grid2">
        <label class="field">
          <div class="fieldLabel">Сортировка</div>
          <select class="select" data-action="sort-key">
            ${colOptions.map((c) => option(c, c || "—", sortKey)).join("")}
          </select>
        </label>

        <label class="field">
          <div class="fieldLabel">Направление</div>
          <select class="select" data-action="sort-dir">
            ${option("asc", "ASC", sortDir)}
            ${option("desc", "DESC", sortDir)}
          </select>
        </label>
      </div>

      <div class="grid2">
        <label class="field">
          <div class="fieldLabel">Фильтр: колонка</div>
          <select class="select" data-action="filter-column">
            ${colOptions.map((c) => option(c, c || "—", filterCol)).join("")}
          </select>
        </label>

        <label class="field">
          <div class="fieldLabel">Фильтр: содержит</div>
          <input class="input" data-action="filter-query" type="text" value="${escapeHtml(
            filterQuery
          )}" placeholder="например: card" />
        </label>
      </div>

      <label class="field">
        <div class="fieldLabel">Размер страницы</div>
        <select class="select" data-action="page-size">
          ${option("10", "10", String(state.pageSize))}
          ${option("25", "25", String(state.pageSize))}
          ${option("50", "50", String(state.pageSize))}
        </select>
      </label>

      <label class="field">
        <div class="fieldLabel">Статистика по колонке (числовые)</div>
        <select class="select" data-action="stats-column">
          ${[""]
            .concat(view.numericColumns)
            .map((c) => option(c, c || "—", statsCol))
            .join("")}
        </select>
      </label>

      <div class="grid2">
        <label class="field">
          <div class="fieldLabel">График: X</div>
          <select class="select" data-action="chart-x">
            ${[""]
              .concat(view.stringColumns)
              .map((c) => option(c, c || "—", chartX))
              .join("")}
          </select>
        </label>

        <label class="field">
          <div class="fieldLabel">График: Y (числовая)</div>
          <select class="select" data-action="chart-y">
            ${[""]
              .concat(view.numericColumns)
              .map((c) => option(c, c || "—", chartY))
              .join("")}
          </select>
        </label>
      </div>

      <button class="btn btnSecondary" type="button" data-action="reset-controls">
        Сбросить фильтры/поиск/сорт
      </button>

      <div class="muted small">
        Строк: всего ${view.totalRows}, отображается ${
    view.visibleRows
  } (после поиска/фильтра).
      </div>
    </div>
  `;
}
