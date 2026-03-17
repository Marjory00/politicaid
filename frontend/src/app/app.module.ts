import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TooltipModule } from 'primeng/tooltip';
import { ComparePage }   from './pages/compare/compare.page';
import { DialogModule }  from 'primeng/dialog';


import { TableModule }          from 'primeng/table';
import { ChartModule }          from 'primeng/chart';
import { CardModule }           from 'primeng/card';
import { TagModule }            from 'primeng/tag';
import { BadgeModule }          from 'primeng/badge';
import { InputTextModule }      from 'primeng/inputtext';
import { ButtonModule }         from 'primeng/button';
import { DropdownModule }       from 'primeng/dropdown';
import { ProgressBarModule }    from 'primeng/progressbar';
import { ToastModule }          from 'primeng/toast';
import { ToolbarModule }        from 'primeng/toolbar';
import { PanelModule }          from 'primeng/panel';
import { TabViewModule }        from 'primeng/tabview';
import { ProgressSpinnerModule }from 'primeng/progressspinner';
import { DividerModule }        from 'primeng/divider';
import { MessageService }       from 'primeng/api';

import { AppRoutingModule }          from './app-routing.module';
import { AppComponent }              from './app.component';
import { NavbarComponent }           from './components/navbar/navbar.component';
import { BillCardComponent }         from './components/bill-card/bill-card.component';
import { SearchBarComponent }        from './components/search-bar/search-bar.component';
import { SentimentChartComponent }   from './components/sentiment-chart/sentiment-chart.component';
import { VotingTrendsComponent }     from './components/voting-trends/voting-trends.component';
import { HomePage }                  from './pages/home/home.page';
import { BillsPage }                 from './pages/bills/bills.page';
import { AnalyticsPage }             from './pages/analytics/analytics.page';
import { BillDetailPage }            from './pages/bill-detail/bill-detail.page';
import { ApiInterceptor }            from './interceptors/api.interceptor';

@NgModule({
  declarations: [
    AppComponent, NavbarComponent, BillCardComponent,
    SearchBarComponent, SentimentChartComponent, VotingTrendsComponent,
    HomePage, BillsPage, AnalyticsPage, BillDetailPage,
      ComparePage,
  ],
  imports: [
    BrowserModule, BrowserAnimationsModule, HttpClientModule,
    FormsModule, ReactiveFormsModule, AppRoutingModule,
    TableModule, ChartModule, CardModule, TagModule, BadgeModule,
    InputTextModule, ButtonModule, DropdownModule, ProgressBarModule,
    ToastModule, ToolbarModule, PanelModule, TabViewModule,
    ProgressSpinnerModule, DividerModule, TooltipModule,
    DialogModule, TooltipModule,
  ],
  providers: [
    MessageService,
    { provide: HTTP_INTERCEPTORS, useClass: ApiInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}