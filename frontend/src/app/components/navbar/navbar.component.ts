import { Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  template: `
    <nav class="navbar">
      <div class="navbar-inner">
        <div class="navbar-brand">
          <div class="brand-logo">
            <i class="pi pi-building"></i>
          </div>
          <div class="brand-text">
            <span class="brand-name">PoliticAID</span>
            <span class="brand-tagline">Legislative Intelligence</span>
          </div>
        </div>
        <div class="navbar-links">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">
            <i class="pi pi-home"></i>
            <span>Dashboard</span>
          </a>
          <a routerLink="/bills" routerLinkActive="active">
            <i class="pi pi-file-o"></i>
            <span>Bills</span>
          </a>
          <a routerLink="/analytics" routerLinkActive="active">
            <i class="pi pi-chart-bar"></i>
            <span>Analytics</span>
          </a>
        </div>
        <div class="navbar-actions">
          <div class="status-pill">
            <span class="status-dot"></span>
            <span>Live</span>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      height: 64px;
      background: rgba(255,255,255,0.95);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(0,0,0,0.06);
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03);
    }
    .navbar-inner {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 2rem;
      height: 100%;
      display: flex;
      align-items: center;
      gap: 2rem;
    }
    .navbar-brand {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      text-decoration: none;
      flex-shrink: 0;
    }
    .brand-logo {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #1e3a5f, #2563eb);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1rem;
      box-shadow: 0 2px 8px rgba(37,99,235,0.3);
    }
    .brand-text {
      display: flex;
      flex-direction: column;
      line-height: 1.1;
    }
    .brand-name {
      font-size: 1rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.03em;
    }
    .brand-tagline {
      font-size: 0.65rem;
      font-weight: 500;
      color: #94a3b8;
      letter-spacing: 0.02em;
      text-transform: uppercase;
    }
    .navbar-links {
      display: flex;
      gap: 0.25rem;
      flex: 1;
    }
    .navbar-links a {
      text-decoration: none;
      color: #64748b;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-weight: 600;
      font-size: 0.875rem;
      padding: 0.45rem 0.85rem;
      border-radius: 8px;
      transition: all 0.15s;
      letter-spacing: -0.01em;
    }
    .navbar-links a i { font-size: 0.85rem; }
    .navbar-links a:hover {
      color: #1e293b;
      background: #f1f5f9;
    }
    .navbar-links a.active {
      color: #2563eb;
      background: #eff6ff;
      font-weight: 700;
    }
    .navbar-actions { margin-left: auto; }
    .status-pill {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 20px;
      padding: 0.3rem 0.75rem;
      font-size: 0.75rem;
      font-weight: 600;
      color: #16a34a;
    }
    .status-dot {
      width: 6px;
      height: 6px;
      background: #22c55e;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.6; transform: scale(0.8); }
    }
    @media (max-width: 768px) {
      .brand-tagline { display: none; }
      .navbar-links a span { display: none; }
      .navbar-actions { display: none; }
    }
  `]
})
export class NavbarComponent {}