export type RowValue = string | number | boolean | null;
export type DataRow = Record<string, RowValue>;

export type Status = "empty" | "loading" | "ready" | "error";
export type SortDir = "asc" | "desc";

export interface AppState {
  rows: DataRow[];
  columns: string[];
  sourceName: string;

  status: Status;
  errorMessage: string;

  search: string;
  sortKey: string;
  sortDir: SortDir;

  filterColumn: string;
  filterQuery: string;

  page: number;
  pageSize: number;

  statsColumn: string;
  chartX: string;
  chartY: string;
}

export interface DerivedView {
  numericColumns: string[];
  stringColumns: string[];

  totalRows: number;
  visibleRows: number;

  pageRows: DataRow[];
  pageCount: number;
  safePage: number;

  statsColumn: string;
  stats:
    | { enabled: false; reason?: string }
    | {
        enabled: true;
        count: number;
        sum: number;
        avg: number;
        min: number;
        max: number;
      };

  chartX: string;
  chartY: string;
  chartData:
    | { enabled: false }
    | { enabled: true; labels: string[]; values: number[]; title: string };
}
