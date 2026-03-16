import { Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  template: `
    <nav class="navbar">
      <div class="navbar-brand">
        <i class="pi pi-building"></i>
        <span>PoliticAID</span>
      </div>
      <div class="navbar-links">
        <a routerLink="/"          routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">
          <i class="pi pi-home"></i> Dashboard
        </a>
        <a routerLink="/bills"     routerLinkActive="active">
          <i class="pi pi-file-o"></i> Bills
        </a>
        <a routerLink="/analytics" routerLinkActive="active">
          <i class="pi pi-chart-bar"></i> Analytics
        </a>
      </div>
    </nav>
  `,
  styles: [`
    .navbar { height:64px; background:var(--surface-card); border-bottom:1px solid var(--surface-border);
              display:flex; align-items:center; padding:0 2rem; gap:3rem; position:sticky; top:0; z-index:1000; }
    .navbar-brand { display:flex; align-items:center; gap:0.5rem; font-size:1.25rem; font-weight:700; color:var(--primary-color); }
    .navbar-links { display:flex; gap:1.5rem; }
    .navbar-links a { text-decoration:none; color:var(--text-color-secondary); display:flex; align-items:center;
                      gap:0.4rem; font-weight:500; padding:0.4rem 0.75rem; border-radius:6px; transition:all 0.2s; }
    .navbar-links a:hover, .navbar-links a.active { color:var(--primary-color); background:var(--primary-50,#eff6ff); }
  `]
})
export class NavbarComponent {}