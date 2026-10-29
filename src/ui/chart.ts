import { BarController, BarElement, CategoryScale, Chart, LinearScale, Tooltip } from 'chart.js';
import type { WordCount } from '../core/types';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip);

export const TOP_CHART_WORDS = 15;
const BAR_HEIGHT_PX = 28;
const AXIS_HEIGHT_PX = 40;

type ChartElements = {
  container: HTMLElement;
  canvasWrapper: HTMLElement;
  canvas: HTMLCanvasElement;
};

export type FrequencyChart = { update: (rows: WordCount[]) => void };

export function createFrequencyChart({ container, canvasWrapper, canvas }: ChartElements): FrequencyChart {
  const styles = getComputedStyle(document.documentElement);
  const accent = styles.getPropertyValue('--color-accent').trim();
  const muted = styles.getPropertyValue('--color-muted').trim();
  const border = styles.getPropertyValue('--color-border').trim();

  const chart = new Chart<'bar', number[], string>(canvas, {
    type: 'bar',
    data: { labels: [], datasets: [{ data: [], backgroundColor: accent, borderRadius: 4, maxBarThickness: 20 }] },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 300 },
      plugins: {
        tooltip: { callbacks: { label: (item) => `${item.parsed.x} ${item.parsed.x === 1 ? 'vez' : 'vezes'}` } },
      },
      scales: {
        x: { beginAtZero: true, ticks: { precision: 0, color: muted }, grid: { color: border } },
        y: { ticks: { color: muted, autoSkip: false }, grid: { display: false } },
      },
    },
  });

  return {
    update(rows) {
      const top = rows.slice(0, TOP_CHART_WORDS);
      container.hidden = top.length === 0;
      if (top.length === 0) return;

      canvasWrapper.style.height = `${top.length * BAR_HEIGHT_PX + AXIS_HEIGHT_PX}px`;
      chart.data.labels = top.map(({ word }) => word);
      chart.data.datasets[0]!.data = top.map(({ count }) => count);
      chart.update();
      canvas.setAttribute('aria-label', describe(top));
    },
  };
}

function describe(rows: WordCount[]): string {
  const items = rows.map(({ word, count }) => `${word}: ${count}`).join(', ');
  return `Gráfico de barras com as palavras mais frequentes. ${items}.`;
}
