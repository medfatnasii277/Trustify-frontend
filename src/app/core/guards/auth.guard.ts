import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { Observable, map, tap } from 'rxjs';
import { KeycloakService } from '../services/keycloak.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  constructor(
    private keycloakService: KeycloakService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot
  ): Observable<boolean | UrlTree> {
    return this.keycloakService.isAuthenticated().pipe(
      map(authenticated => {
        if (!authenticated) {
          return this.router.createUrlTree(['/auth/login']);
        }
        return true;
      })
    );
  }
}