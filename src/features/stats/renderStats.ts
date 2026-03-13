import type { AppState, DerivedView } from "../../core/types";

export function renderStats(root: HTMLElement, { state, view }: {state: AppState; view: DerivedView}): void {
  root.innerHTML = `
    <div class="cardHeader">
      <h3>Статистика</h3>
      <p class="muted">колонка: ${view.statsColumn || "—"}</p>
    </div>

    <div class="statsGrid">
      <div class="stat">
        <p class="statLabel">Всего строк</p>
        <p class="statValue">${view.totalRows}</p>
      </div>

      <div class="stat">
        <p class="statLabel">После фильтра/поиска</p>
        <p class="statValue">${view.visibleRows}</p>
      </div>

      ${
        view.stats?.enabled
          ? `
        <div class="stat">
          <p class="statLabel">Count (числовые)</p>
          <p class="statValue">${view.stats.count}</p>
        </div>
        <div class="stat">
          <p class="statLabel">Sum</p>
          <p class="statValue">${Math.round(view.stats.sum * 100) / 100}</p>
        </div>
        <div class="stat">
          <p class="statLabel">Avg</p>
          <p class="statValue">${Math.round(view.stats.avg * 100) / 100}</p>
        </div>
        <div class="stat">
          <p class="statLabel">Min / Max</p>
          <p class="statValue">${view.stats.min} / ${view.stats.max}</p>
        </div>
      `
          : `
        <p class="statsEmpty">
          ${
            state.status === "ready"
              ? "Выберите числовую колонку для статистики (или загрузите данные с числовыми колонками)."
              : "Статистика появится после загрузки данных."
          }
        </p>
      `
      }
    </div>
  `;
}
