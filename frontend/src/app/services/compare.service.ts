import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CompareService {
  private api = `${environment.apiUrl}/compare`;
  constructor(private http: HttpClient) {}

  compareBills(billId1: string, billId2: string): Observable<any> {
    return this.http.get(`${this.api}/${billId1}/${billId2}`);
  }
}