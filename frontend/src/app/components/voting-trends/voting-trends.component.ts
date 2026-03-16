import { Component, OnInit } from '@angular/core';
import { AnalyticsService } from '../../services/analytics.service';

@Component({
  selector: 'app-voting-trends',
  template: `
    <p-chart type="bar" [data]="chartData" [options]="options" height="260px"
             *ngIf="chartData; else loading"></p-chart>
    <ng-template #loading>
      <div style="display:flex;justify-content:center;padding:2rem">
        <p-progressSpinner strokeWidth="4" [style]="{'width':'40px','height':'40px'}"></p-progressSpinner>
      </div>
    </ng-template>
  `,
})
export class VotingTrendsComponent implements OnInit {
  chartData: any;
  options = {
    responsive:true, maintainAspectRatio:false,
    plugins:{ legend:{ position:'top' } },
    scales:{ x:{ stacked:false }, y:{ beginAtZero:true } },
  };

  constructor(private analytics: AnalyticsService) {}

  ngOnInit(): void {
    this.analytics.getVotingTrends().subscribe(data => {
      const t = data.voting_trends;
      this.chartData = {
        labels: t.map((r: any) => r.party || 'Unknown'),
        datasets: [
          { label:'Yea',     data:t.map((r:any)=>r.yea_votes),     backgroundColor:'#22c55e' },
          { label:'Nay',     data:t.map((r:any)=>r.nay_votes),     backgroundColor:'#ef4444' },
          { label:'Abstain', data:t.map((r:any)=>r.abstain_votes), backgroundColor:'#94a3b8' },
        ],
      };
    });
  }
}