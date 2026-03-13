import type { AppState, SortDir } from "./types";

type Listener = (s: AppState) => void;

function createStore(initialState: AppState) {
  let state: AppState = { ...initialState };
  const listeners = new Set<Listener>();

  function getState(): AppState {
    return state;
  }

  function setState(next: Partial<AppState> | ((s: AppState) => AppState)) {
    state = typeof next === "function" ? next(state) : { ...state, ...next };
    listeners.forEach((fn) => fn(state));
  }

  function subscribe(fn: Listener) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  return { getState, setState, subscribe };
}

export function createDashboardStore() {
  const initialState: AppState = {
    rows: [],
    columns: [],
    sourceName: "",

    status: "empty", // "empty" | "loading" | "ready" | "error"
    errorMessage: "",
    search: "",
    sortKey: "",
    sortDir: "asc", // "asc" | "desc"
    filterColumn: "",
    filterQuery: "",
    page: 1,
    pageSize: 10,

    statsColumn: "",
    chartX: "",
    chartY: "",
  };

  const store = createStore(initialState);

  const actions = {
    setStatus(status: AppState["status"], errorMessage = "") {
      store.setState({ status, errorMessage });
    },

    setDataset({
      rows,
      columns,
      sourceName,
    }: {
      rows: AppState["rows"];
      columns: string[];
      sourceName?: string;
    }) {
      store.setState({
        rows,
        columns,
        sourceName: sourceName ?? "",
        status: "ready",
        errorMessage: "",
        page: 1,
      });
    },

    setSearch(search: string) {
      store.setState({ search, page: 1 });
    },

    setSort(key: string) {
      store.setState((s) => {
        if (!key) return s;

        const sameKey = s.sortKey === key;

        const nextDir: SortDir =
          sameKey && s.sortDir === "asc" ? "desc" : "asc";

        return { ...s, sortKey: key, sortDir: nextDir, page: 1 };
      });
    },

    setSortKey(sortKey: string) {
      store.setState((s) => ({ ...s, sortKey, page: 1 }));
    },

    SetSortDir(sortDir: SortDir) {
      store.setState((s) => ({ ...s, sortDir, page: 1 }));
    },

    setFilterColumn(filterColumn: string) {
      store.setState({ filterColumn, page: 1 });
    },

    setFilterQuery(filterQuery: string) {
      store.setState({ filterQuery, page: 1 });
    },

    setPage(page: number) {
      store.setState({ page: Math.max(1, Number(page) || 1) });
    },

    setPageSize(pageSize: number) {
      store.setState({ pageSize: Number(pageSize) || 10, page: 1 });
    },

    resetControls() {
      store.setState((s) => ({
        ...s,
        search: "",
        sortKey: "",
        sortDir: "asc",
        filterColumn: "",
        filterQuery: "",
        page: 1,
      }));
    },

    setStatsColumn(statsColumn: string) {
      store.setState({ statsColumn });
    },

    setChartX(chartX: string) {
      store.setState({ chartX });
    },

    setChartY(chartY: string) {
      store.setState({ chartY });
    },
  };

  return { store, actions };
}
