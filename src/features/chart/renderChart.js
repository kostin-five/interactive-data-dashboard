import Chart from "chart.js/auto";

let chartInstance = null;

export function renderChart(root, { view }) {
  root.replaceChildren();

  if (!view.chartData?.enabled) {
    const box = document.createElement("div");
    box.className = "emptyBox";
    box.textContent =
      "График недоступен: выберите X (строковая колонка) и Y (числовая колонка) или загрузите подходящие данные.";
    root.appendChild(box);

    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }
    return;
  }

  const title = document.createElement("div");
  title.className = "chartTitle";
  title.textContent = view.chartData.title;

  // dedicated container под canvas (Chart.js responsiveness best practice)
  const container = document.createElement("div");
  container.className = "chartContainer";

  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-label", "График данных");
  canvas.setAttribute("role", "img");

  container.appendChild(canvas);

  root.appendChild(title);
  root.appendChild(container);

  const ctx = canvas.getContext("2d");

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: view.chartData.labels,
      datasets: [
        {
          label: "Сумма",
          data: view.chartData.values,
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true },
      },
    },
  });
}
