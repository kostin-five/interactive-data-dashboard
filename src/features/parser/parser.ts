import type { DataRow } from "../../core/types";

function normalizeValue(v: unknown) {
  const s = String(v ?? "").trim();

  if (s === "" || s.toLowerCase() === "null") return null;

  if (s.toLowerCase() === "true") return true;
  if (s.toLowerCase() === "false") return false;

  const n = Number(s);
  if (Number.isFinite(n) && s !== "") return n;

  return s;
}

function parseCSV(text: string): DataRow[] {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const headers = lines[0].split(",");

  return lines.slice(1).map((line) => {
    const cells = line.split(",");
    const row: DataRow = {};
    headers.forEach((h, i) => {
      row[h] = normalizeValue(cells[i]);
    });
    return row;
  });
}

function parseJSON(text: string): DataRow[] {
  const raw = JSON.parse(text);
  if (!Array.isArray(raw)) {
    throw new Error("JSON должен быть массивом объектов");
  }

  return raw.map((obj) => {
    const row: DataRow = {};
    for (const [k, v] of Object.entries(obj)) {
      row[k] = normalizeValue(v);
    }
    return row;
  });
}

export function parseDatasetFromText({
  text,
  fileName = "",
}: {
  text: string;
  fileName?: string;
}) {
  let rows: DataRow[];

  if (fileName?.endsWith(".json")) {
    rows = parseJSON(text);
  } else {
    rows = parseCSV(text);
  }

  const columns = Array.from(new Set(rows.flatMap((r) => Object.keys(r))));

  return { rows, columns };
}
