function splitLines(text) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

function normalizeValue(v) {
  const s = String(v ?? "").trim();

  if (s === "" || s.toLowerCase() === "null") return null;

  // boolean
  if (s.toLowerCase() === "true") return true;
  if (s.toLowerCase() === "false") return false;

  // number (простая эвристика)
  const n = Number(s);
  if (Number.isFinite(n) && s !== "") return n;

  return s;
}

function parseCSV(text) {
  const lines = splitLines(text);
  if (lines.length < 2) return [];

  // ВНИМАНИЕ: это простой CSV парсер (без кавычек/экранирования).
  // Для “боевого” CSV можно подключить PapaParse.
  const headers = lines[0].split(",").map((h) => h.trim());

  return lines.slice(1).map((line) => {
    const cells = line.split(",");
    const row = {};
    headers.forEach((h, i) => {
      row[h] = normalizeValue(cells[i]);
    });
    return row;
  });
}

function parseJSON(text) {
  const raw = JSON.parse(text);
  if (!Array.isArray(raw))
    throw new Error("JSON должен быть массивом объектов");
  return raw.map((obj) => {
    if (obj && typeof obj === "object" && !Array.isArray(obj)) {
      const out = {};
      for (const [k, v] of Object.entries(obj)) out[k] = normalizeValue(v);
      return out;
    }
    throw new Error("Каждый элемент JSON массива должен быть объектом");
  });
}

function unionColumns(rows) {
  const set = new Set();
  for (const r of rows) {
    for (const k of Object.keys(r)) set.add(k);
  }
  return Array.from(set);
}

export function parseDatasetFromText({ text, fileName = "" }) {
  const name = fileName.toLowerCase();
  const trimmed = text.trim();
  if (!trimmed) throw new Error("Файл пустой");

  let rows;

  if (name.endsWith(".json")) rows = parseJSON(trimmed);
  else if (name.endsWith(".csv")) rows = parseCSV(trimmed);
  else {
    // fallback: пробуем JSON, иначе CSV
    try {
      rows = parseJSON(trimmed);
    } catch {
      rows = parseCSV(trimmed);
    }
  }

  const columns = unionColumns(rows);

  return { rows, columns };
}
