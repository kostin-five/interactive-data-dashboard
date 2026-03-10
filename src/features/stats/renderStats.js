export function renderStats(root, { state, view }) {
  root.innerHTML = `
    <div class="cardHeader">
      <div>Статистика</div>
      <div class="muted">колонка: ${view.statsColumn || "—"}</div>
    </div>

    <div class="statsGrid">
      <div class="stat">
        <div class="statLabel">Всего строк</div>
        <div class="statValue">${view.totalRows}</div>
      </div>

      <div class="stat">
        <div class="statLabel">После фильтра/поиска</div>
        <div class="statValue">${view.visibleRows}</div>
      </div>

      ${
        view.stats?.enabled
          ? `
        <div class="stat">
          <div class="statLabel">Count (числовые)</div>
          <div class="statValue">${view.stats.count}</div>
        </div>
        <div class="stat">
          <div class="statLabel">Sum</div>
          <div class="statValue">${Math.round(view.stats.sum * 100) / 100}</div>
        </div>
        <div class="stat">
          <div class="statLabel">Avg</div>
          <div class="statValue">${Math.round(view.stats.avg * 100) / 100}</div>
        </div>
        <div class="stat">
          <div class="statLabel">Min / Max</div>
          <div class="statValue">${view.stats.min} / ${view.stats.max}</div>
        </div>
      `
          : `
        <div class="statsEmpty">
          ${
            state.status === "ready"
              ? "Выберите числовую колонку для статистики (или загрузите данные с числовыми колонками)."
              : "Статистика появится после загрузки данных."
          }
        </div>
      `
      }
    </div>
  `;
}
