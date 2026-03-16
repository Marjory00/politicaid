import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <p-toast position="top-right"></p-toast>
    <app-navbar></app-navbar>
    <main class="main-content">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    .main-content {
      min-height: calc(100vh - 64px);
      background: var(--surface-ground);
    }
  `]
})
export class AppComponent {}