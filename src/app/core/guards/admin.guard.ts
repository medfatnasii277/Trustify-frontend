import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { map } from 'rxjs';
import { KeycloakService } from '../services/keycloak.service';

/**
 * Admin route guard
 * Prevents non-admin users from accessing admin routes
 */
export const adminGuard = () => {
  const keycloakService = inject(KeycloakService);
  const router = inject(Router);

  console.log('Admin Guard: Checking if user has admin role');
  
  return keycloakService.hasRole('admin').pipe(
    map(hasAdminRole => {
      if (hasAdminRole) {
        console.log('Admin Guard: User has admin role - access granted');
        return true;
      }

      console.log('Admin Guard: User does not have admin role - redirecting to dashboard');
      router.navigate(['/dashboard']);
      return false;
    })
  );
};
