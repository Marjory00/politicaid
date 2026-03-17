import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BillService }    from '../../services/bill.service';
import { SearchService }  from '../../services/search.service';
import { Bill }           from '../../models/bill.model';

import { ExportService } from '../../services/export.service';

 // Add to class properties
const exportingCSV = false;
const exportingPDF = false;

@Component({
  selector: 'app-bills',
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1><i class="pi pi-file-o"></i> Bills</h1>
        <p>Browse, filter, and search all legislative bills.</p>
      </div>

      <div class="filters-row">
        <app-search-bar [initialQuery]="searchQuery" (search)="onSearch($event)"></app-search-bar>
        <p-dropdown [options]="statusOptions" [(ngModel)]="selectedStatus" placeholder="Status"
          optionLabel="label" optionValue="value" (onChange)="applyFilters()" [showClear]="true">
        </p-dropdown>
        <p-dropdown [options]="chamberOptions" [(ngModel)]="selectedChamber" placeholder="Chamber"
          optionLabel="label" optionValue="value" (onChange)="applyFilters()" [showClear]="true">
        </p-dropdown>
        <p-dropdown [options]="partyOptions" [(ngModel)]="selectedParty" placeholder="Party"
          optionLabel="label" optionValue="value" (onChange)="applyFilters()" [showClear]="true">
        </p-dropdown>
      </div>

      // Add to the template, after the party dropdown:
<div class="export-btns">
  <p-button
    icon="pi pi-file-excel"
    label="CSV"
    styleClass="p-button-outlined p-button-sm p-button-success"
    (onClick)="exportCSV()"
    [loading]="exportingCSV"
    pTooltip="Export filtered results as CSV">
  </p-button>
  <p-button
    icon="pi pi-file-pdf"
    label="PDF"
    styleClass="p-button-outlined p-button-sm p-button-danger"
    (onClick)="exportPDF()"
    [loading]="exportingPDF"
    pTooltip="Export filtered results as PDF">
  </p-button>
</div>

      <div class="results-info" *ngIf="!loading">
        {{ total | number }} bill(s) found
        <span *ngIf="searchQuery"> for "<strong>{{ searchQuery }}</strong>"</span>
      </div>

      <div *ngIf="loading" style="display:flex;justify-content:center;padding:4rem">
        <p-progressSpinner strokeWidth="4"></p-progressSpinner>
      </div>

      <div class="bills-grid" *ngIf="!loading">
        <app-bill-card *ngFor="let bill of bills" [bill]="bill" (click)="goToBill(bill.id)">
        </app-bill-card>
      </div>

      <div class="empty-state" *ngIf="!loading && bills.length === 0">
        <i class="pi pi-search" style="font-size:3rem;color:var(--text-color-secondary)"></i>
        <p>No bills found. Adjust your search or filters.</p>
      </div>

      <div class="pagination" *ngIf="!loading && total > pageSize">
        <p-button icon="pi pi-chevron-left" [disabled]="page===1"
          (onClick)="changePage(page-1)" styleClass="p-button-text"></p-button>
        <span>Page {{ page }} of {{ totalPages }}</span>
        <p-button icon="pi pi-chevron-right" [disabled]="page>=totalPages"
          (onClick)="changePage(page+1)" styleClass="p-button-text"></p-button>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding:2rem; max-width:1400px; margin:0 auto; }
    .page-header { margin-bottom:1.5rem; }
    .page-header h1 { font-size:1.75rem; font-weight:700; display:flex; align-items:center; gap:0.5rem; margin:0 0 0.5rem; }
    .page-header p { color:var(--text-color-secondary); margin:0; }
    .filters-row { display:flex; flex-wrap:wrap; gap:1rem; margin-bottom:1.5rem; align-items:center; }
    .results-info { margin-bottom:1rem; color:var(--text-color-secondary); font-size:0.9rem; }
    .bills-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(340px,1fr)); gap:1rem; }
    .empty-state { text-align:center; padding:4rem; color:var(--text-color-secondary); }
    .pagination { display:flex; align-items:center; justify-content:center; gap:1rem; margin-top:2rem; }
  `]
})
export class BillsPage implements OnInit {
exportingPDF: unknown;
exportPDF() {
throw new Error('Method not implemented.');
}
  bills: Bill[] = []; total = 0; page = 1; pageSize = 20; loading = true;
  searchQuery = ''; selectedStatus = ''; selectedChamber = ''; selectedParty = '';

  statusOptions  = [{label:'Introduced',value:'introduced'},{label:'In Committee',value:'in_committee'},
                    {label:'Passed House',value:'passed_house'},{label:'Passed Senate',value:'passed_senate'},
                    {label:'Enacted',value:'enacted'},{label:'Vetoed',value:'vetoed'},{label:'Failed',value:'failed'}];
  chamberOptions = [{label:'House',value:'House'},{label:'Senate',value:'Senate'}];
  partyOptions   = [{label:'Democrat',value:'D'},{label:'Republican',value:'R'},{label:'Independent',value:'I'}];
exportCSV: any;
exportingCSV: unknown;

  get totalPages(): number { return Math.ceil(this.total / this.pageSize); }

  constructor(private billSvc: BillService, private searchSvc: SearchService,
              private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(p => { this.searchQuery = p['q'] || ''; this.load(); });
  }

  load(): void {
    this.loading = true;
    const filters = { status:this.selectedStatus, chamber:this.selectedChamber, party:this.selectedParty };
    if (this.searchQuery) {
      this.searchSvc.search(this.searchQuery, { ...filters, page:this.page, pageSize:this.pageSize })
        .subscribe(d => { this.bills = d.results; this.total = d.total; this.loading = false; });
    } else {
      this.billSvc.getBills(this.page, this.pageSize, filters)
        .subscribe(d => { this.bills = d.bills; this.total = d.total; this.loading = false; });
    }
  }

  onSearch(q: string): void  { this.searchQuery = q; this.page = 1; this.load(); }
  applyFilters(): void        { this.page = 1; this.load(); }
  changePage(p: number): void { this.page = p; this.load(); }
  goToBill(id: string): void  { this.router.navigate(['/bills', id]); }
}