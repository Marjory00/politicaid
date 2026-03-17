import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AlertCreate {
  email:       string;
  bill_id:     string;
  bill_number: string;
}

export interface AlertResponse {
  id:          string;
  email:       string;
  bill_id:     string;
  bill_number: string;
  last_status: string;
  is_active:   boolean;
  created_at:  string;
}

@Injectable({ providedIn: 'root' })
export class AlertService {
  private api = `${environment.apiUrl}/alerts`;
  constructor(private http: HttpClient) {}

  createAlert(payload: AlertCreate): Observable<AlertResponse> {
    return this.http.post<AlertResponse>(this.api, payload);
  }

  getAlertsByEmail(email: string): Observable<any> {
    return this.http.get(`${this.api}/email/${email}`);
  }

  deleteAlert(alertId: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${alertId}`);
  }
}