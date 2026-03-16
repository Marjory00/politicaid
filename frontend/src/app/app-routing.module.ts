import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePage }       from './pages/home/home.page';
import { BillsPage }      from './pages/bills/bills.page';
import { AnalyticsPage }  from './pages/analytics/analytics.page';
import { BillDetailPage } from './pages/bill-detail/bill-detail.page';

const routes: Routes = [
  { path: '',          component: HomePage,       title: 'Dashboard' },
  { path: 'bills',     component: BillsPage,      title: 'Bills' },
  { path: 'bills/:id', component: BillDetailPage, title: 'Bill Detail' },
  { path: 'analytics', component: AnalyticsPage,  title: 'Analytics' },
  { path: '**',        redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}