function formatCell(v) {
  if (v == null) return "—";
  if (typeof v === "boolean") return v ? "true" : "false";
  if (typeof v === "number") return Number.isFinite(v) ? String(v) : "—";
  return String(v);
}

export function renderTable(root, { state, view }) {
  root.replaceChildren();

  if (state.status !== "ready") {
    const box = document.createElement("div");
    box.className = "emptyBox";
    box.textContent =
      state.status === "loading"
        ? "Загрузка данных…"
        : "Нет данных. Загрузите CSV или JSON.";
    root.appendChild(box);
    return;
  }

  if (state.columns.length === 0) {
    const box = document.createElement("div");
    box.className = "emptyBox";
    box.textContent = "Нет колонок. Проверьте формат файла.";
    root.appendChild(box);
    return;
  }

  const table = document.createElement("table");
  table.className = "table";

  const thead = document.createElement("thead");
  const trh = document.createElement("tr");

  for (const col of state.columns) {
    const th = document.createElement("th");
    th.scope = "col";

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "thBtn";
    btn.setAttribute("data-action", "sort");
    btn.setAttribute("data-key", col);

    // aria-sort
    let ariaSort = "none";
    if (state.sortKey === col)
      ariaSort = state.sortDir === "asc" ? "ascending" : "descending";
    th.setAttribute("aria-sort", ariaSort);

    btn.textContent = col;

    if (state.sortKey === col) {
      const mark = document.createElement("span");
      mark.className = "sortMark";
      mark.textContent = state.sortDir === "asc" ? " ▲" : " ▼";
      btn.appendChild(mark);
    }

    th.appendChild(btn);
    trh.appendChild(th);
  }

  thead.appendChild(trh);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");

  for (const row of view.pageRows) {
    const tr = document.createElement("tr");
    for (const col of state.columns) {
      const td = document.createElement("td");
      td.textContent = formatCell(row?.[col]);
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }

  table.appendChild(tbody);
  root.appendChild(table);
}
