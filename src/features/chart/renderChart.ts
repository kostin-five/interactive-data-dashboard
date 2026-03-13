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

  const canvas = document.createElement("canvas");

  root.appendChild(canvas);

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
        },
      ],
    },
  });
}
