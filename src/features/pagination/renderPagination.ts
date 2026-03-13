import type { AppState, DerivedView } from "../../core/types";

function buildPages(current: number, total: number): Array<number | "..."> {
  const pages: Array<number | "..."> = [];
  const windowSize = 5;

  if (total <= windowSize) {
    for (let p = 1; p <= total; p++) pages.push(p);
    return pages;
  }

  pages.push(1);

  const start = Math.max(2, current - 2);
  const end = Math.min(total - 1, current + 2);

  if (start > 2) pages.push("...");

  for (let p = start; p <= end; p++) pages.push(p);

  if (end < total - 1) pages.push("...");

  if (total > 1) pages.push(total);

  return pages;
}

export function renderPagination(root: HTMLElement, { state, view } : {state: AppState; view: DerivedView}): void {
  root.replaceChildren();

  if (state.status !== "ready") return;

  const current = view.safePage;
  const total = view.pageCount;

  const left = document.createElement("div");
  left.className = "pagerLeft";
  left.textContent = `Стр. ${current} из ${total}`;

  const right = document.createElement("div");
  right.className = "pagerRight";

  const prev = document.createElement("button");
  prev.type = "button";
  prev.className = "btn";
  prev.textContent = "Назад";
  prev.disabled = current <= 1;
  prev.setAttribute("data-action", "page-prev");

  const next = document.createElement("button");
  next.type = "button";
  next.className = "btn";
  next.textContent = "Вперёд";
  next.disabled = current >= total;
  next.setAttribute("data-action", "page-next");

  const pagesWrap = document.createElement("div");
  pagesWrap.className = "pages";

  for (const p of buildPages(current, total)) {
    if (p === "...") {
      const span = document.createElement("span");
      span.className = "dots";
      span.textContent = "...";
      pagesWrap.appendChild(span);
      continue;
    }

    const b = document.createElement("button");
    b.type = "button";
    b.className = "pageBtn";
    b.textContent = String(p);
    b.setAttribute("data-action", "page");
    b.setAttribute("data-page", String(p));
    if (p === current) b.setAttribute("aria-current", "page");
    pagesWrap.appendChild(b);
  }

  right.appendChild(prev);
  right.appendChild(pagesWrap);
  right.appendChild(next);

  root.appendChild(left);
  root.appendChild(right);
}
