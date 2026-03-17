
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ExportService {
  private api = `${environment.apiUrl}/export`;
  constructor(private http: HttpClient) {}

  exportCSV(filters: { status?: string; chamber?: string; party?: string } = {}): Observable<Blob> {
    let p = new HttpParams();
    if (filters.status)  p = p.set('status',  filters.status);
    if (filters.chamber) p = p.set('chamber', filters.chamber);
    if (filters.party)   p = p.set('party',   filters.party);
    return this.http.get(`${this.api}/csv`, { params: p, responseType: 'blob' });
  }

  exportPDF(filters: { status?: string; chamber?: string; party?: string } = {}): Observable<Blob> {
    let p = new HttpParams();
    if (filters.status)  p = p.set('status',  filters.status);
    if (filters.chamber) p = p.set('chamber', filters.chamber);
    if (filters.party)   p = p.set('party',   filters.party);
    return this.http.get(`${this.api}/pdf`, { params: p, responseType: 'blob' });
  }

  exportSingleBillPDF(billId: string): Observable<Blob> {
    return this.http.get(`${this.api}/bill/${billId}/pdf`, { responseType: 'blob' });
  }

  downloadFile(blob: Blob, filename: string): void {
    const url  = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href  = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}