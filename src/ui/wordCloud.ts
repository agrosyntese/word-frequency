import { Chart, Tooltip } from 'chart.js';
import { WordCloudController, WordElement } from 'chartjs-chart-wordcloud';
import { scaleFontSizes } from '../core/wordCloud';
import { cssVar, describe, timesLabel, type WordChart } from './chartUtils';

Chart.register(WordCloudController, WordElement, Tooltip);

export const TOP_CLOUD_WORDS = 60;
const MIN_FONT_PX = 14;
const MAX_FONT_PX = 64;
const MAX_FONT_WIDTH_RATIO = 0.12;
const PALETTE_VARS = ['--cloud-1', '--cloud-2', '--cloud-3', '--cloud-4', '--cloud-5'];

export function createWordCloud(wrapper: HTMLElement, canvas: HTMLCanvasElement): WordChart {
  let chart: Chart<'wordCloud', number[], string> | null = null;
  let counts: number[] = [];

  return {
    update(rows) {
      const top = rows.slice(0, TOP_CLOUD_WORDS);
      if (top.length === 0) return;

      counts = top.map(({ count }) => count);
      const maxFont = Math.min(MAX_FONT_PX, wrapper.clientWidth * MAX_FONT_WIDTH_RATIO);
      const labels = top.map(({ word }) => word);
      const sizes = scaleFontSizes(counts, MIN_FONT_PX, Math.max(MIN_FONT_PX, maxFont));

      if (chart) {
        chart.data.labels = labels;
        chart.data.datasets[0]!.data = sizes;
        chart.update();
      } else {
        // Created lazily and with data: the plugin crashes when laid out with no words.
        chart = createChart(canvas, labels, sizes, () => counts);
      }
      canvas.setAttribute('aria-label', describe('Nuvem de palavras', top));
    },
  };
}

function createChart(
  canvas: HTMLCanvasElement,
  labels: string[],
  sizes: number[],
  getCounts: () => number[],
): Chart<'wordCloud', number[], string> {
  const palette = PALETTE_VARS.map(cssVar);

  return new Chart<'wordCloud', number[], string>(canvas, {
    type: 'wordCloud',
    data: {
      labels,
      datasets: [
        {
          data: sizes,
          color: (ctx) => palette[ctx.dataIndex % palette.length] ?? palette[0]!,
          // Mostly horizontal, with every fourth word vertical, for readability.
          rotate: (ctx) => (ctx.dataIndex % 4 === 3 ? 90 : 0),
          padding: 2,
          family: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
          weight: 600,
          // `fit` rescales around the wrong center and clips words, so lay out at real size instead.
          fit: false,
          autoGrow: { maxTries: 0, scalingFactor: 1 },
          randomRotationSeed: 'word-frequency',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 300 },
      plugins: {
        tooltip: { callbacks: { label: (item) => timesLabel(getCounts()[item.dataIndex] ?? 0) } },
      },
    },
  });
}
