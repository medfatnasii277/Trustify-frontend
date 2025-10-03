import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import Keycloak from 'keycloak-js';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class KeycloakService {
  private keycloak: Keycloak | undefined;
  private authenticated = new BehaviorSubject<boolean>(false);
  private userProfile = new BehaviorSubject<any>(null);
  private userRoles = new BehaviorSubject<string[]>([]);

  constructor(private router: Router) {}

  /**
   * Initialize Keycloak instance
   */
  init(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        this.keycloak = new Keycloak({
          url: environment.keycloak.url,
          realm: environment.keycloak.realm,
          clientId: environment.keycloak.clientId
        });

        this.keycloak.init({
          onLoad: 'check-sso',
          pkceMethod: 'S256',
          checkLoginIframe: false
        })
        .then((authenticated: boolean) => {
          this.authenticated.next(authenticated);

          if (authenticated) {
            this.loadUserProfile();
            this.updateUserRoles();
            this.setupTokenRefresh();
            this.storeTokens();
            this.redirectBasedOnRole();
          }

          resolve(authenticated);
        })
        .catch((error) => {
          console.error('Failed to initialize Keycloak', error);
          reject(error);
        });
      } catch (error) {
        console.error('Exception initializing Keycloak', error);
        reject(error);
      }
    });
  }

  /**
   * Login with username and password directly (no redirect to Keycloak UI)
   */
  async loginWithCredentials(username: string, password: string): Promise<boolean> {
    try {
      // Get the Keycloak token endpoint URL
      const tokenUrl = `${environment.keycloak.url}/realms/${environment.keycloak.realm}/protocol/openid-connect/token`;

      // Prepare the form data for the token request
      const formData = new URLSearchParams();
      formData.append('client_id', environment.keycloak.clientId);
      formData.append('grant_type', 'password');
      formData.append('username', username);
      formData.append('password', password);
      formData.append('scope', 'openid');

      // Make the direct token request
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Authentication failed: ${response.status} ${response.statusText}`);
      }

      const tokenResponse = await response.json();

      // Store the tokens and update authentication state
      if (this.keycloak) {
        this.keycloak.token = tokenResponse.access_token;
        this.keycloak.refreshToken = tokenResponse.refresh_token;
        this.keycloak.idToken = tokenResponse.id_token;
        this.keycloak.authenticated = true;

        // Set token expiration
        this.keycloak.tokenParsed = this.parseToken(tokenResponse.access_token);
        this.keycloak.refreshTokenParsed = this.parseToken(tokenResponse.refresh_token);

        // Store token in localStorage for the HTTP interceptor
        localStorage.setItem('token', tokenResponse.access_token);
        localStorage.setItem('refreshToken', tokenResponse.refresh_token);

        // Update BehaviorSubjects
        this.authenticated.next(true);
        this.loadUserProfile();
        this.updateUserRoles();

        // Setup automatic token refresh
        this.setupTokenRefresh();

        // Navigate based on user role
        this.redirectBasedOnRole();

        return true;
      } else {
        throw new Error('Keycloak not initialized');
      }
    } catch (error) {
      console.error('Authentication failed:', error);
      throw error;
    }
  }

  /**
   * Parse JWT token and return the payload
   */
  private parseToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(window.atob(base64));
    } catch (e) {
      return {};
    }
  }
  login(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (!this.keycloak) {
        return reject('Keycloak not initialized');
      }

      this.keycloak.login({
        redirectUri: window.location.origin + '/dashboard'
      })
      .then(() => {
        resolve();
      })
      .catch((error: any) => {
        reject(error);
      });
    });
  }

  /**
   * Register with Keycloak
   */
  register(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (!this.keycloak) {
        return reject('Keycloak not initialized');
      }

      // Use auth endpoint with registration parameters
      const registrationUrl = `${environment.keycloak.url}/realms/${environment.keycloak.realm}/protocol/openid-connect/auth?client_id=${environment.keycloak.clientId}&redirect_uri=${encodeURIComponent(window.location.origin + '/auth/login')}&response_type=code&scope=openid&kc_action=register`;

      // Redirect to registration page
      window.location.href = registrationUrl;
      resolve();
    });
  }

  /**
   * Logout from Keycloak
   */
  logout(): Promise<void> {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');

    return this.keycloak?.logout({
      redirectUri: window.location.origin + '/auth/login'
    }) as Promise<void>;
  }

  /**
   * Check if the user is authenticated
   */
  isAuthenticated(): Observable<boolean> {
    return this.authenticated.asObservable();
  }

  /**
   * Get user profile information
   */
  getUserProfile(): Observable<any> {
    return this.userProfile.asObservable();
  }

  /**
   * Get the access token
   */
  getToken(): Observable<string> {
    return of(this.keycloak?.token || '');
  }

  /**
   * Get user roles
   */
  getUserRoles(): Observable<string[]> {
    return this.userRoles.asObservable();
  }

  /**
   * Check if user has a specific role (case-insensitive)
   */
  hasRole(role: string): Observable<boolean> {
    return this.getUserRoles().pipe(
      map(roles => roles.some(r => r.toLowerCase() === role.toLowerCase()))
    );
  }

  /**
   * Load the user profile from Keycloak
   */
  private loadUserProfile(): void {
    if (this.keycloak?.authenticated) {
      from(this.keycloak.loadUserProfile()).pipe(
        tap(profile => {
          this.userProfile.next(profile);
        }),
        catchError(error => {
          console.error('Could not load user profile', error);
          return of(null);
        })
      ).subscribe();
    }
  }

  /**
   * Update user roles from the token
   */
  private updateUserRoles(): void {
    if (this.keycloak?.authenticated && this.keycloak.tokenParsed) {
      const realmRoles = this.keycloak.tokenParsed.realm_access?.roles || [];
      this.userRoles.next(realmRoles);
    }
  }

  /**
   * Store tokens in localStorage
   */
  private storeTokens(): void {
    if (this.keycloak?.token) {
      localStorage.setItem('token', this.keycloak.token);
    }
    if (this.keycloak?.refreshToken) {
      localStorage.setItem('refreshToken', this.keycloak.refreshToken);
    }
  }

  /**
   * Redirect user based on their role (case-insensitive)
   */
  private redirectBasedOnRole(): void {
    const roles = this.userRoles.getValue();
    console.log('Redirecting based on roles:', roles);

    const hasAdminRole = roles.some(r => r.toLowerCase() === 'admin');
    const hasUserRole = roles.some(r => r.toLowerCase() === 'user');

    if (hasAdminRole) {
      console.log('User has admin role, navigating to /hello-admin');
      this.router.navigate(['/hello-admin']);
    } else if (hasUserRole) {
      console.log('User has user role, navigating to /dashboard');
      // Dashboard route will check profile completion via guard
      this.router.navigate(['/dashboard']);
    } else {
      console.log('User has no specific role, navigating to /dashboard');
      this.router.navigate(['/dashboard']);
    }
  }

  /**
   * Setup automatic token refresh
   */
  private setupTokenRefresh(): void {
    if (this.keycloak) {
      this.keycloak.onTokenExpired = () => {
        this.keycloak?.updateToken(30)
          .then((refreshed: boolean) => {
            if (refreshed) {
              this.storeTokens();
            }
          })
          .catch((error: any) => {
            console.error('Failed to refresh token', error);
            this.logout();
          });
      };
    }
  }

  /**
   * Get Keycloak URL
   */
  getKeycloakUrl(): string {
    return environment.keycloak.url;
  }

  /**
   * Get Keycloak realm
   */
  getRealm(): string {
    return environment.keycloak.realm;
  }

  /**
   * Get Keycloak client ID
   */
  getClientId(): string {
    return environment.keycloak.clientId;
  }
}