import type { AppState, DataRow, DerivedView, RowValue } from "./types";

function isNumberValue(v: RowValue): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export function deriveView(state: AppState): DerivedView {
  const { rows, columns } = state;

  const numericColumns: string[] = [];
  const stringColumns: string[] = [];

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

  const q = state.search.trim().toLowerCase();
  const filterCol = state.filterColumn;
  const filterQ = state.filterQuery.trim().toLowerCase();

  let filtered: DataRow[] = rows;

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

  const sortKey = state.sortKey;
  const sortDir = state.sortDir;

  let sorted = filtered;

  if (sortKey) {
    sorted = [...filtered].sort((a, b) => {
      const av = a?.[sortKey];
      const bv = b?.[sortKey];

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

  const total = rows.length;
  const visible = sorted.length;

  const pageSize = Math.max(1, state.pageSize | 0);
  const pageCount = Math.max(1, Math.ceil(visible / pageSize));
  const safePage = clamp(state.page, 1, pageCount);

  const start = (safePage - 1) * pageSize;
  const pageRows = sorted.slice(start, start + pageSize);

  const statsColumn = state.statsColumn || numericColumns[0] || "";
  const stats = computeStats(sorted, statsColumn);

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

function computeStats(rows: DataRow[], col: string): DerivedView["stats"] {
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

function buildChartData(rows: DataRow[], xKey: string, yKey: string): DerivedView["chartData"] {
  if (!xKey || !yKey) return { enabled: false };

  const agg = new Map<string, number>();

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
