import { Injectable } from '@angular/core';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);
@Injectable({ providedIn: 'root' })
export class ChartService {
  initChart(
    canvas: HTMLCanvasElement,
    data: Record<string, number>,
    label: string,
    type: 'bar' | 'pie' | 'line' | 'doughnut'
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
            backgroundColor: this.getColors(Object.keys(data).length),
          },
        ],
      },
    });
  }

  getColors(length: number) {
    const chartColors = [];
    const colors = ['#4361EE', '#3A86FF', '#5BC0EB', '#9D4EDD', '#7209B7', '#B5179E'];
    for (let i = 0; i < length; i++) {
      chartColors.push(colors[i % colors.length]);
    }
    return chartColors;
  }
}
