import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Bill, BillListResponse } from '../models/bill.model';

@Injectable({ providedIn: 'root' })
export class BillService {
  private api = `${environment.apiUrl}/bills`;
  constructor(private http: HttpClient) {}

  getBills(page=1, pageSize=20, filters: {status?:string; chamber?:string; party?:string}={}): Observable<BillListResponse> {
    let p = new HttpParams().set('page', page).set('page_size', pageSize);
    if (filters.status)  p = p.set('status',  filters.status);
    if (filters.chamber) p = p.set('chamber', filters.chamber);
    if (filters.party)   p = p.set('party',   filters.party);
    return this.http.get<BillListResponse>(this.api, { params: p });
  }

  getBill(id: string): Observable<Bill> {
    return this.http.get<Bill>(`${this.api}/${id}`);
  }

  analyzeBill(id: string): Observable<Bill> {
    return this.http.post<Bill>(`${this.api}/${id}/analyze`, {});
  }

  createBill(payload: Partial<Bill>): Observable<Bill> {
    return this.http.post<Bill>(this.api, payload);
  }

  updateBill(id: string, payload: Partial<Bill>): Observable<Bill> {
    return this.http.put<Bill>(`${this.api}/${id}`, payload);
  }

  deleteBill(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}