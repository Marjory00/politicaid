import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private api = `${environment.apiUrl}/analytics`;
  constructor(private http: HttpClient) {}

  getSummary(): Observable<any>           { return this.http.get(`${this.api}/summary`); }
  getSentimentOverTime(): Observable<any> { return this.http.get(`${this.api}/sentiment-over-time`); }
  getStatusBreakdown(): Observable<any>   { return this.http.get(`${this.api}/status-breakdown`); }
  getTopSubjects(limit=10): Observable<any> {
    return this.http.get(`${this.api}/top-subjects`, { params: new HttpParams().set('limit', limit) });
  }
  getVotingTrends(chamber?: string, party?: string): Observable<any> {
    let p = new HttpParams();
    if (chamber) p = p.set('chamber', chamber);
    if (party)   p = p.set('party', party);
    return this.http.get(`${this.api}/voting-trends`, { params: p });
  }
}