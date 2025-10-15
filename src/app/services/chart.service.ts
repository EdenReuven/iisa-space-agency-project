import { Injectable } from '@angular/core';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);
@Injectable({ providedIn: 'root' })
export class ChartService {
  initChart(
    canvas: HTMLCanvasElement,
    data: Record<string, number>,
    label: string,
    type: 'bar' | 'pie' | 'line'
  ): Chart {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Cannot get canvas context');

    return new Chart(ctx, {
      type,
      data: {
        labels: Object.keys(data),
        datasets: [
          {
            label: label,
            data: Object.values(data),
            backgroundColor: this._getColors(Object.keys(data).length),
          },
        ],
      },
    });
  }

  private _getColors(length: number) {
    const chartColors = [];
    const colors = [' #1F77B4', '#FF7F0E', '#2CA02C', '#D62728', '#9467BD', '#8C564B'];
    for (let i = 0; i < length; i++) {
      chartColors.push(colors[i % colors.length]);
    }
    return chartColors;
  }
}
