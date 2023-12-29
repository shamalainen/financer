import { ScriptableContext } from 'chart.js';

import { colorPalette } from '$constants/colorPalette';

const getGradientColorByLabel = (label: string) => {
  switch (label) {
    case 'expenses':
      return colorPalette.red;

    case 'incomes':
      return colorPalette.green;

    default:
      return colorPalette.blue;
  }
};

export const setGradientLineGraphBackground = (
  context: ScriptableContext<'line'>,
) => {
  const { ctx, chartArea } = context.chart;

  if (!chartArea) return;

  const label = context.dataset.label;

  const { top, bottom } = chartArea;
  const gradient = ctx.createLinearGradient(0, bottom, 0, top);

  const color = getGradientColorByLabel(label?.toLowerCase() || '');

  gradient.addColorStop(0.5, `${color}1A`);
  gradient.addColorStop(0, 'transparent');

  return gradient;
};
