import Chart from "chart.js/auto";
import type { DerivedView } from "../../core/types";

let chartInstance: Chart | null = null;

export function renderChart(
  root: HTMLElement,
  { view }: { view: DerivedView }
) {
  root.replaceChildren();

  if (!view.chartData.enabled) {
    root.textContent = "График недоступен";
    return;
  }

  // const title = document.createElement("div");
  // title.className = "chartTitle";
  // title.textContent = view.chartData.title;
  // const container = document.createElement("div");
  // container.className = "chartContainer";

  const canvas = document.createElement("canvas");
  // canvas.setAttribute("aria-label", "График данных");
  // canvas.setAttribute("role", "img");

  root.appendChild(canvas);

  // root.appendChild(title);
  // root.appendChild(container);

  const ctx = canvas.getContext("2d");

  if (!ctx) return;

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: view.chartData.labels,
      datasets: [
        {
          label: "Сумма",
          data: view.chartData.values,
          // borderWidth: 1,
        },
      ],
    },
    // options: {
    //   responsive: true,
    //   maintainAspectRatio: false,
    //   scales: {
    //     y: { beginAtZero: true },
    //   },
    // },
  });
}
