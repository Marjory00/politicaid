import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePage }       from './pages/home/home.page';
import { BillsPage }      from './pages/bills/bills.page';
import { AnalyticsPage }  from './pages/analytics/analytics.page';
import { BillDetailPage } from './pages/bill-detail/bill-detail.page';
import { ComparePage }    from './pages/compare/compare.page';

const routes: Routes = [
  { path: '',           component: HomePage,       title: 'Dashboard — PoliticAId' },
  { path: 'bills',      component: BillsPage,      title: 'Bills — PoliticAId' },
  { path: 'bills/:id',  component: BillDetailPage, title: 'Bill Detail — PoliticAId' },
  { path: 'analytics',  component: AnalyticsPage,  title: 'Analytics — PoliticAId' },
  { path: 'compare',    component: ComparePage,    title: 'Compare Bills — PoliticAId' },
  { path: '**',         redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}