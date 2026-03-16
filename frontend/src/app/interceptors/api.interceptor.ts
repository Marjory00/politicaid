import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MessageService } from 'primeng/api';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  constructor(private msg: MessageService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((err: HttpErrorResponse) => {
        this.msg.add({
          severity: 'error',
          summary: `Error ${err.status}`,
          detail: err.error?.detail || err.message,
          life: 5000,
        });
        return throwError(() => err);
      })
    );
  }
}