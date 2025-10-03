import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { UserProfileService } from '../services/user-profile.service';

/**
 * Guard to check if user has completed their profile
 * If not completed, redirect to profile completion page
 */
export const profileCompletionGuard: CanActivateFn = (route, state) => {
  const userProfileService = inject(UserProfileService);
  const router = inject(Router);

  return userProfileService.getCurrentUserProfile().pipe(
    map(profile => {
      if (profile && profile.profileCompleted) {
        // Profile is completed, allow navigation
        return true;
      } else {
        // Profile not completed, redirect to profile completion
        console.log('Profile not completed, redirecting to profile completion');
        router.navigate(['/user/complete-profile']);
        return false;
      }
    }),
    catchError(error => {
      // If profile doesn't exist (404), redirect to profile completion
      console.log('Profile not found, redirecting to profile completion', error);
      router.navigate(['/user/complete-profile']);
      return of(false);
    })
  );
};
