function isNumberValue(v) {
  return typeof v === "number" && Number.isFinite(v);
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export function deriveView(state) {
  const { rows, columns } = state;

  // 1) типы колонок (простая эвристика)
  const numericColumns = [];
  const stringColumns = [];

  for (const col of columns) {
    let hasNumber = false;
    let hasNonNumber = false;

    for (let i = 0; i < Math.min(rows.length, 200); i++) {
      const v = rows[i]?.[col];
      if (v == null || v === "") continue;
      if (typeof v === "number") hasNumber = true;
      else hasNonNumber = true;
    }

    if (hasNumber && !hasNonNumber) numericColumns.push(col);
    else stringColumns.push(col);
  }

  // 2) filter + search
  const q = state.search.trim().toLowerCase();
  const filterCol = state.filterColumn;
  const filterQ = state.filterQuery.trim().toLowerCase();

  let filtered = rows;

  if (filterCol && filterQ) {
    filtered = filtered.filter((r) =>
      String(r?.[filterCol] ?? "")
        .toLowerCase()
        .includes(filterQ)
    );
  }

  if (q) {
    filtered = filtered.filter((r) => {
      for (const col of columns) {
        const value = String(r?.[col] ?? "").toLowerCase();
        if (value.includes(q)) return true;
      }
      return false;
    });
  }

  // 3) sort
  const sortKey = state.sortKey;
  const sortDir = state.sortDir;

  let sorted = filtered;
  if (sortKey) {
    sorted = [...filtered].sort((a, b) => {
      const av = a?.[sortKey];
      const bv = b?.[sortKey];

      // nulls last
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;

      if (typeof av === "number" && typeof bv === "number") {
        return av - bv;
      }

      return String(av).localeCompare(String(bv), "ru");
    });

    if (sortDir === "desc") sorted.reverse();
  }

  // 4) pagination
  const total = rows.length;
  const visible = sorted.length;

  const pageSize = Math.max(1, state.pageSize | 0);
  const pageCount = Math.max(1, Math.ceil(visible / pageSize));
  const safePage = clamp(state.page, 1, pageCount);

  const start = (safePage - 1) * pageSize;
  const pageRows = sorted.slice(start, start + pageSize);

  // 5) stats (по выбранной или по первой числовой колонке)
  const statsColumn = state.statsColumn || numericColumns[0] || "";
  const stats = computeStats(sorted, statsColumn);

  // 6) chart data (агрегация sum по фигурным ключам)
  const chartX = state.chartX || stringColumns[0] || "";
  const chartY = state.chartY || numericColumns[0] || "";
  const chartData = buildChartData(sorted, chartX, chartY);

  return {
    numericColumns,
    stringColumns,
    totalRows: total,
    visibleRows: visible,
    pageRows,
    pageCount,
    safePage,
    statsColumn,
    stats,
    chartX,
    chartY,
    chartData,
  };
}

function computeStats(rows, col) {
  if (!col) {
    return { enabled: false };
  }

  const values = rows.map((r) => r?.[col]).filter(isNumberValue);

  if (values.length === 0) {
    return { enabled: false, reason: "Нет числовых значений" };
  }

  let sum = 0;
  let min = values[0];
  let max = values[0];

  for (const v of values) {
    sum += v;
    if (v < min) min = v;
    if (v > max) max = v;
  }

  const avg = sum / values.length;

  return {
    enabled: true,
    count: values.length,
    sum,
    avg,
    min,
    max,
  };
}

function buildChartData(rows, xKey, yKey) {
  if (!xKey || !yKey) return { enabled: false };

  const agg = new Map();

  for (const r of rows) {
    const label = String(r?.[xKey] ?? "—");
    const v = r?.[yKey];
    if (!isNumberValue(v)) continue;
    agg.set(label, (agg.get(label) ?? 0) + v);
  }

  const pairs = Array.from(agg.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  const labels = pairs.map(([k]) => k);
  const values = pairs.map(([, v]) => v);

  return {
    enabled: labels.length > 0,
    labels,
    values,
    title: `Top-10 по сумме ${yKey} (группировка по ${xKey})`,
  };
}
