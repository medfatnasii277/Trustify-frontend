import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { Observable, map, of } from 'rxjs';
import { KeycloakService } from '../services/keycloak.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard {
  constructor(
    private keycloakService: KeycloakService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot
  ): Observable<boolean | UrlTree> {
    const requiredRole = route.data['role'] as string;
    console.log('RoleGuard: Checking access for path', route.routeConfig?.path);
    console.log('RoleGuard: Required role is', requiredRole);
    
    if (!requiredRole) {
      console.warn('No role specified for RoleGuard');
      return of(this.router.createUrlTree(['/auth/login']));
    }
    
    return this.keycloakService.hasRole(requiredRole).pipe(
      map(hasRole => {
        console.log(`RoleGuard: User ${hasRole ? 'has' : 'does not have'} the required role: ${requiredRole}`);
        
        if (!hasRole) {
          console.log('RoleGuard: Redirecting to access-denied page');
          return this.router.createUrlTree(['/access-denied']);
        }
        console.log('RoleGuard: Access granted');
        return true;
      })
    );
  }
}