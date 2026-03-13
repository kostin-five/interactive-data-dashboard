export interface LayoutRefs {
  appEl: HTMLElement;
  fileInput: HTMLInputElement;
  dropzone: HTMLElement;
  alert: HTMLElement;
  controls: HTMLElement;
  tableRoot: HTMLElement;
  paginationRoot: HTMLElement;
  statsRoot: HTMLElement;
  chartRoot: HTMLElement;
  sourceMeta: HTMLElement;
}

export function renderLayout(appEl: HTMLElement): LayoutRefs {
  appEl.innerHTML = `
        <header class="topbar">
            <div class="brand">
                <h1 class="brandTitle">Interactive Data Dashboard</h1>
                <h2 class="brandSubtitle">CSV/JSON → таблица, фильтры, статистика, график</h2>
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

        <div id="alert" class="alert" aria-live="polite"></div>

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
                            <h2 class="dropTitle">Перетащите CSV/JSON сюда</h2>
                            <p class="dropHint">или нажмите «Загрузить файл»</p>
                            <p class="dropMeta"> Поддерживаются CSV без сложных кавычек и JSON.
                            </p>
                        </div>
                    </section>

                    <section class="card">
                        <div class="cardHeader">
                            <h3>Таблица</h3>
                            <p id="sourceMeta" class="muted"></p>
                        </div>
                        <p class="tableScroll" id="tableRoot"></p>
                        <p class="cardFooter" id="paginationRoot"></p>
                    </section>

                    <section class="card" id="statsRoot"></section>

                    <section class="card">
                        <div class="cardHeader">
                            <h3>График</h3>
                            <p class="muted">агрегация top-10</p>
                        </div>
                        <p id="chartRoot"></p>
                    </section>
            </section>
        </main>
    `;

  const fileInput = appEl.querySelector<HTMLInputElement>("#fileInput");
  const dropzone = appEl.querySelector<HTMLElement>("#dropzone");
  const alert = appEl.querySelector<HTMLElement>("#alert");
  const controls = appEl.querySelector<HTMLElement>("#controls");
  const tableRoot = appEl.querySelector<HTMLElement>("#tableRoot");
  const paginationRoot = appEl.querySelector<HTMLElement>("#paginationRoot");
  const statsRoot = appEl.querySelector<HTMLElement>("#statsRoot");
  const chartRoot = appEl.querySelector<HTMLElement>("#chartRoot");
  const sourceMeta = appEl.querySelector<HTMLElement>("#sourceMeta");

  if (
    !fileInput ||
    !dropzone ||
    !alert ||
    !controls ||
    !tableRoot ||
    !paginationRoot ||
    !statsRoot ||
    !chartRoot ||
    !sourceMeta
  ) {
    throw new Error("Не удалось найти один или несколько элементов layout");
  }

  return {
    appEl,
    fileInput,
    dropzone,
    alert,
    controls,
    tableRoot,
    paginationRoot,
    statsRoot,
    chartRoot,
    sourceMeta,
  };
}
