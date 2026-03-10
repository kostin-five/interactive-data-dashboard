function createStore(initialState) {
  let state = { ...initialState };
  const listeners = new Set();

  function getState() {
    return state;
  }

  function setState(next) {
    state = typeof next === "function" ? next(state) : { ...state, ...next };

    for (const fn of listeners) fn(state);
  }

  function subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  return { getState, setState, subscribe };
}

export function createDashboardStore() {
  const initialState = {
    // данные
    rows: [],
    columns: [],
    sourceName: "",

    // ui status
    status: "empty", // "empty" | "loading" | "ready" | "error"
    errorMessage: "",

    // controls
    search: "",
    sortKey: "",
    sortDir: "asc", // "asc" | "desc"
    filterColumn: "",
    filterQuery: "",
    page: 1,
    pageSize: 10,

    // stats & chart selections
    statsColumn: "",
    chartX: "",
    chartY: "",
  };

  const store = createStore(initialState);

  const actions = {
    setStatus(status, errorMessage = "") {
      store.setState({ status, errorMessage });
    },

    setDataset({ rows, columns, sourceName }) {
      store.setState((s) => ({
        ...s,
        rows,
        columns,
        sourceName: sourceName ?? "",
        status: "ready",
        errorMessage: "",
        page: 1,
        // авто-подстановка осей/статов – оставляем пустыми,
        // deriveView выберет дефолт.
      }));
    },

    setSearch(search) {
      store.setState({ search, page: 1 });
    },

    setSort(key) {
      store.setState((s) => {
        if (!key) return s;
        const sameKey = s.sortKey === key;
        const nextDir = sameKey
          ? s.sortDir === "asc"
            ? "desc"
            : "asc"
          : "asc";
        return { ...s, sortKey: key, sortDir: nextDir, page: 1 };
      });
    },

    setSortKey(sortKey) {
      store.setState((s) => ({ ...s, sortKey, page: 1 }));
    },

    setSortDir(sortDir) {
      store.setState((s) => ({ ...s, sortDir, page: 1 }));
    },

    setFilterColumn(filterColumn) {
      store.setState({ filterColumn, page: 1 });
    },

    setFilterQuery(filterQuery) {
      store.setState({ filterQuery, page: 1 });
    },

    setPage(page) {
      store.setState({ page: Math.max(1, Number(page) || 1) });
    },

    setPageSize(pageSize) {
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

    setStatsColumn(statsColumn) {
      store.setState({ statsColumn });
    },

    setChartX(chartX) {
      store.setState({ chartX });
    },

    setChartY(chartY) {
      store.setState({ chartY });
    },
  };

  return { store, actions };
}
