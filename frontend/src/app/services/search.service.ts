import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SearchService {
  private api = `${environment.apiUrl}/search`;
  constructor(private http: HttpClient) {}

  search(query: string, filters: {
    chamber?:string; status?:string; sentiment?:string; party?:string;
    page?:number; pageSize?:number;
  } = {}): Observable<any> {
    let p = new HttpParams().set('q', query);
    if (filters.chamber)   p = p.set('chamber',   filters.chamber);
    if (filters.status)    p = p.set('status',    filters.status);
    if (filters.sentiment) p = p.set('sentiment', filters.sentiment);
    if (filters.party)     p = p.set('party',     filters.party);
    if (filters.page)      p = p.set('page',      filters.page);
    if (filters.pageSize)  p = p.set('page_size', filters.pageSize);
    return this.http.get<any>(this.api, { params: p });
  }
}