import { Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-sentiment-chart',
  template: `
    <p-chart type="doughnut" [data]="chartData" [options]="options" height="240px"
             *ngIf="chartData; else noData"></p-chart>
    <ng-template #noData>
      <div style="text-align:center;padding:2rem;color:var(--text-color-secondary);font-style:italic">
        No sentiment data yet.
      </div>
    </ng-template>
  `,
})
export class SentimentChartComponent implements OnChanges {
  @Input() data: Record<string, number> | undefined;
  chartData: any;
  options = { responsive:true, maintainAspectRatio:false, plugins:{ legend:{ position:'bottom' } } };

  ngOnChanges(): void {
    if (!this.data) return;
    const colors: Record<string,string> = {
      positive:'#22c55e', negative:'#ef4444', neutral:'#94a3b8', mixed:'#f59e0b'
    };
    const labels = Object.keys(this.data);
    this.chartData = {
      labels: labels.map(l => l.charAt(0).toUpperCase() + l.slice(1)),
      datasets: [{ data: labels.map(l => this.data![l]),
                   backgroundColor: labels.map(l => colors[l] ?? '#94a3b8'), hoverOffset: 4 }],
    };
  }
}