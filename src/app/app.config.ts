import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, HttpInterceptorFn } from '@angular/common/http';

import { routes } from './app.routes';

// HTTP interceptor function for adding auth tokens
const authInterceptorFn: HttpInterceptorFn = (req, next) => {
  // Only add auth headers for API calls to our backend services
  const policyApiUrl = 'http://localhost:8081/api';
  const claimsApiUrl = 'http://localhost:8082/api';
  
  if (req.url.startsWith(policyApiUrl) || req.url.startsWith(claimsApiUrl)) {
    // Get the token from local storage
    const token = localStorage.getItem('token');
    
    if (token) {
      // Clone the request and add the authorization header
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next(authReq);
    }
  }
  
  // Pass through requests that don't need authentication
  return next(req);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptorFn]))
  ]
};
