import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';

@Component({
  selector: 'app-search-bar',
  template: `
    <div class="search-wrapper">
      <i class="pi pi-search search-icon"></i>
      <input pInputText class="search-input" type="text"
             placeholder="Search bills by title, number, sponsor, or keyword..."
             [formControl]="ctrl" (keydown.enter)="onEnter()" />
      <button *ngIf="ctrl.value" class="clear-btn" (click)="clear()">
        <i class="pi pi-times"></i>
      </button>
    </div>
  `,
  styles: [`
    .search-wrapper { position:relative; display:flex; align-items:center; width:100%; max-width:600px; }
    .search-icon { position:absolute; left:0.9rem; color:var(--text-color-secondary); pointer-events:none; }
    .search-input { width:100%; padding:0.65rem 2.5rem 0.65rem 2.4rem; border-radius:8px;
                    font-size:0.9rem; border:1px solid var(--surface-border); background:var(--surface-card); }
    .clear-btn { position:absolute; right:0.75rem; background:none; border:none;
                 cursor:pointer; color:var(--text-color-secondary); padding:0.2rem; }
    .clear-btn:hover { color:var(--text-color); }
  `]
})
export class SearchBarComponent implements OnInit {
  @Input() initialQuery = '';
  @Output() search = new EventEmitter<string>();
  ctrl = new FormControl('');

  ngOnInit(): void {
    if (this.initialQuery) this.ctrl.setValue(this.initialQuery);
    this.ctrl.valueChanges.pipe(
      debounceTime(400), distinctUntilChanged(),
      filter(v => !v || v.length >= 2)
    ).subscribe(v => this.search.emit(v ?? ''));
  }

  onEnter(): void { this.search.emit(this.ctrl.value ?? ''); }
  clear(): void   { this.ctrl.setValue(''); this.search.emit(''); }
}