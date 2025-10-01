import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable, from, switchMap, catchError, throwError } from 'rxjs';
import { KeycloakService } from '../services/keycloak.service';
import { environment } from '../../../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private keycloakService: KeycloakService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Only add auth headers for API calls to our backend
    if (request.url.startsWith(environment.apiUrl)) {
      return this.keycloakService.getToken().pipe(
        switchMap(token => {
          if (token) {
            // Clone the request and add the authorization header
            const authReq = request.clone({
              setHeaders: {
                Authorization: `Bearer ${token}`
              }
            });
            return next.handle(authReq);
          }
          return next.handle(request);
        }),
        catchError(error => {
          console.error('Error in AuthInterceptor:', error);
          return throwError(() => error);
        })
      );
    }
    
    // Pass through requests that don't need authentication
    return next.handle(request);
  }
}