import { BarController, BarElement, CategoryScale, Chart, LinearScale, Tooltip } from 'chart.js';
import { cssVar, describe, timesLabel, type WordChart } from './chartUtils';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip);

export const TOP_BAR_WORDS = 15;
const BAR_HEIGHT_PX = 28;
const AXIS_HEIGHT_PX = 40;

export function createBarChart(wrapper: HTMLElement, canvas: HTMLCanvasElement): WordChart {
  const muted = cssVar('--color-muted');

  const chart = new Chart<'bar', number[], string>(canvas, {
    type: 'bar',
    data: {
      labels: [],
      datasets: [{ data: [], backgroundColor: cssVar('--color-accent'), borderRadius: 4, maxBarThickness: 20 }],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 300 },
      plugins: {
        tooltip: { callbacks: { label: (item) => timesLabel(item.parsed.x ?? 0) } },
      },
      scales: {
        x: { beginAtZero: true, ticks: { precision: 0, color: muted }, grid: { color: cssVar('--color-border') } },
        y: { ticks: { color: muted, autoSkip: false }, grid: { display: false } },
      },
    },
  });

  return {
    update(rows) {
      const top = rows.slice(0, TOP_BAR_WORDS);
      wrapper.style.height = `${top.length * BAR_HEIGHT_PX + AXIS_HEIGHT_PX}px`;
      chart.data.labels = top.map(({ word }) => word);
      chart.data.datasets[0]!.data = top.map(({ count }) => count);
      chart.update();
      canvas.setAttribute('aria-label', describe('Gráfico de barras', top));
    },
  };
}
