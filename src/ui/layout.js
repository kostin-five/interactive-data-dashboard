export function renderLayout(appEl) {
  appEl.innerHTML = `
        <header class="topbar>
            <div class="brand">
                <div class"brandTitle">Interactive Data Dashboard</div>
                <div class="brandSubtitle">CSV/JSON → таблица, фильтры, статистика, график</div>
            </div>

            <div class="topbarActions">
                <label class="btn" for="fileInput">Загрузить файл</label>
                <input
                    id="fileInput"
                    type="file"
                    accept=".csv,.json,application/json,text/csv"
                    hidden />
                <button class="btn btnSecondary" type="button" data-action="load-demo">
                    Загрузить демо
                </button>
            </div>
        </header>

        <div id="alert class="alert" aria-live="polite"></div>

        <main class="appGrid">
            <aside class="card" id="controls"></aside>

            <section class="contentCol">
                <section
                    id="dropzone"
                    class="dropzone"
                    tabindex="0"
                    role="button"
                    aria-label="Зона загрузки файла. Перетащите CSV или JSON"
                    >
                        <div>
                            <div class="dropTitle">Перетащите CSV/JSON сюда</div>
                            <div class="dropHint">или нажмите «Загрузить файл»</div>
                            <div class="dropMeta"> Поддерживаются CSV без сложных кавычек и JSON.
                            </div>
                        </div>
                    </section>

                    <section class="card">
                        <div class="cardHeader">
                            <div>Таблица</div>
                            <div id="sourceMeta" class="muted"></div>
                        </div>
                        <div class="tableScroll" id="tableRoot"></div>
                        <div class="cardFooter" id="paginationRoot"></div>
                    </section>

                    <section class="card" id="statsRoot"></section>

                    <section class="card">
                        <div class="cardHeader">
                            <div>График</div>
                            <div class="muted">агрегация top-10</div>
                        </div>
                        <div id="chartRoot"></div>
                    </section>
            </section>
        </main>
    `;

  return {
    appEl,
    fileInput: appEl.querySelector("#fileInput"),
    dropzone: appEl.querySelector("#dropzone"),
    alert: appEl.querySelector("#alert"),
    controls: appEl.querySelector("#controls"),
    tableRoot: appEl.querySelector("#tableRoot"),
    paginationRoot: appEl.querySelector("#paginationRoot"),
    statsRoot: appEl.querySelector("#statsRoot"),
    chartRoot: appEl.querySelector("#chartRoot"),
    sourceMeta: appEl.querySelector("#sourceMeta"),
  };
}
