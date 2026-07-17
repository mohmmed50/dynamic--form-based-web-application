import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'حدث خطأ غير متوقع. الرجاء المحاولة مرة أخرى.';

        if (error.error instanceof ErrorEvent) {
          // Client-side or network error
          errorMessage = `خطأ في الاتصال: ${error.error.message}`;
        } else {
          // Backend returned an unsuccessful status code
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          } else {
            errorMessage = `رمز الخطأ: ${error.status}\nالرسالة: ${error.message}`;
          }
        }

        // Output error to console or trigger UI Alert
        console.error('HTTP Error Intercepted:', errorMessage);
        
        // Return custom error so components can display it
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
