import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <p-toast position="top-right"></p-toast>
    <app-navbar></app-navbar>
    <main class="main-content">
      <router-outlet></router-outlet>
    </main>
    <footer class="footer">
      <div class="footer-inner">
        <div class="footer-left">
          <div class="footer-brand">
            <div class="footer-logo"><i class="pi pi-building"></i></div>
            <span class="footer-name">PoliticAID</span>
          </div>
          <p class="footer-desc">AI-powered legislative bill analysis platform — tracking, summarizing, and analyzing U.S. congressional bills.</p>
        </div>
        <div class="footer-center">
          <span class="footer-credit">
            Designed & built by <strong>Marjory D. Marquez</strong>
          </span>
          <div class="footer-links">
            <a href="https://github.com/Marjory00" target="_blank" rel="noopener" class="footer-link">
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              GitHub
            </a>
            <a href="https://codepen.io/Marjory00" target="_blank" rel="noopener" class="footer-link">
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                <path d="M24 8.182l-.018-.087-.017-.05c-.01-.024-.018-.05-.03-.075l-.023-.045-.03-.05-.036-.055-.027-.03-.05-.05-.06-.045-.046-.03-.06-.03-.057-.02-.07-.015-.045-.01L12.016 0h-.032l-.013.003-11.84 7.797-.046.03-.06.03-.057.027-.05.04-.04.05-.03.06-.02.055-.01.06-.003.06v7.67l.003.06.01.055.02.057.03.056.04.05.05.04.057.03.06.027.06.02.057.01.06.003h.05l11.87 7.842.06.03.06.02.06.01.06.003.06-.003.06-.01.06-.02.06-.03 11.87-7.842h.05l.06-.003.06-.01.06-.02.06-.027.057-.03.05-.04.04-.05.03-.056.02-.057.01-.055.003-.06V8.57l-.003-.06-.01-.06-.02-.057-.03-.06-.04-.05zM12 16.05l-4.508-2.963L12 10.12l4.508 2.966L12 16.05zm-5.01-6.854l-2.52 1.657-2.52-1.657 2.52-1.657 2.52 1.657zm0 3.806l2.49 1.636-2.49 1.636v-3.272zm5.01 6.462l-2.49-1.636 2.49-1.636 2.49 1.636-2.49 1.636zm5.01-6.462v3.272l-2.49-1.636 2.49-1.636zm0-3.806l-2.52 1.657-2.52-1.657 2.52-1.657 2.52 1.657zm-5.01-1.248l-4.508-2.966L12 2.19l4.508 2.997L12 8.198z"/>
              </svg>
              CodePen
            </a>
          </div>
        </div>
        <div class="footer-right">
          <span class="footer-copy">© {{ currentYear }} PoliticAID. All rights reserved.</span>
          <span class="footer-stack">Angular · FastAPI · PostgreSQL · AI/NLP</span>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .main-content {
      min-height: calc(100vh - 64px);
      background: #f1f5f9;
    }

    /* ── Footer ── */
    .footer {
      background: #0f172a;
      color: white;
      padding: 2.5rem 2rem;
      margin-top: 0;
    }
    .footer-inner {
      max-width: 1400px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 2rem;
      align-items: center;
    }

    /* Left */
    .footer-brand {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      margin-bottom: 0.75rem;
    }
    .footer-logo {
      width: 32px; height: 32px;
      background: linear-gradient(135deg, #1d4ed8, #3b82f6);
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.9rem; color: white;
    }
    .footer-name {
      font-size: 1rem;
      font-weight: 800;
      color: white;
      letter-spacing: -0.02em;
    }
    .footer-desc {
      font-size: 0.8rem;
      color: #94a3b8;
      line-height: 1.6;
      margin: 0;
    }

    /* Center */
    .footer-center {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      text-align: center;
    }
    .footer-credit {
      font-size: 0.88rem;
      color: #cbd5e1;
    }
    .footer-credit strong {
      color: white;
      font-weight: 700;
    }
    .footer-links {
      display: flex;
      gap: 0.75rem;
    }
    .footer-link {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 8px;
      padding: 0.45rem 0.9rem;
      font-size: 0.82rem;
      font-weight: 600;
      color: #cbd5e1;
      text-decoration: none;
      transition: all 0.2s;
    }
    .footer-link:hover {
      background: #334155;
      color: white;
      border-color: #475569;
    }

    /* Right */
    .footer-right {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.4rem;
    }
    .footer-copy {
      font-size: 0.8rem;
      color: #94a3b8;
    }
    .footer-stack {
      font-size: 0.75rem;
      color: #64748b;

    /* Responsive */
    @media (max-width: 768px) {
      .footer-inner {
        grid-template-columns: 1fr;
        text-align: center;
      }
      .footer-brand { justify-content: center; }
      .footer-right { align-items: center; }
    }
  `]
})
export class AppComponent {
  currentYear = new Date().getFullYear();
}