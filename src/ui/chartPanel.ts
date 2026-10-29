import type { WordCount } from '../core/types';
import { createBarChart, TOP_BAR_WORDS } from './barChart';
import type { WordChart } from './chartUtils';
import { createWordCloud, TOP_CLOUD_WORDS } from './wordCloud';

type ChartView = 'bar' | 'cloud';

type ChartPanelElements = {
  container: HTMLElement;
  caption: HTMLElement;
  toggleButtons: HTMLButtonElement[];
  barWrapper: HTMLElement;
  barCanvas: HTMLCanvasElement;
  cloudWrapper: HTMLElement;
  cloudCanvas: HTMLCanvasElement;
};

const CAPTIONS: Record<ChartView, string> = {
  bar: `As ${TOP_BAR_WORDS} palavras mais frequentes`,
  cloud: `Nuvem com até ${TOP_CLOUD_WORDS} palavras`,
};

export function createChartPanel(elements: ChartPanelElements): WordChart {
  const { container, caption, toggleButtons, barWrapper, cloudWrapper } = elements;
  const wrappers: Record<ChartView, HTMLElement> = { bar: barWrapper, cloud: cloudWrapper };
  const charts: Record<ChartView, WordChart> = {
    bar: createBarChart(barWrapper, elements.barCanvas),
    cloud: createWordCloud(cloudWrapper, elements.cloudCanvas),
  };
  let view: ChartView = 'bar';
  let rows: WordCount[] = [];

  // Only the visible chart is drawn: a hidden canvas has no size to lay words out in.
  function render(): void {
    container.hidden = rows.length === 0;
    caption.textContent = CAPTIONS[view];
    for (const key of Object.keys(wrappers) as ChartView[]) {
      wrappers[key].hidden = key !== view;
    }
    for (const button of toggleButtons) {
      button.setAttribute('aria-pressed', String(button.dataset.view === view));
    }
    if (rows.length > 0) charts[view].update(rows);
  }

  for (const button of toggleButtons) {
    button.addEventListener('click', () => {
      const next = button.dataset.view;
      if ((next === 'bar' || next === 'cloud') && next !== view) {
        view = next;
        render();
      }
    });
  }

  return {
    update(nextRows) {
      rows = nextRows;
      render();
    },
  };
}
