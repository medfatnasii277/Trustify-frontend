import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
import { KeycloakService } from './core/services/keycloak.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected title = 'trustify-frontend';
  initialized = false;

  constructor(private keycloakService: KeycloakService, private router: Router) {}

  ngOnInit(): void {
    this.initializeKeycloak();
    
    // Add a safety timeout to prevent getting stuck on loading screen
    setTimeout(() => {
      if (!this.initialized) {
        console.warn('Keycloak initialization timeout - forcing initialization');
        this.initialized = true;
        this.router.navigate(['/auth/login']);
      }
    }, 5000); // 5 second timeout
  }

  private initializeKeycloak(): void {
    this.keycloakService.init()
      .then((authenticated) => {
        console.log('Keycloak initialized successfully, authenticated:', authenticated);
        this.initialized = true;

        // Handle initial routing after Keycloak initialization
        const currentUrl = this.router.url;
        console.log('Current URL:', currentUrl);

        if (!authenticated) {
          // User is not authenticated, redirect to login only if not already there
          if (!currentUrl.startsWith('/auth/')) {
            this.router.navigate(['/auth/login']);
          }
        } else {
          // User is authenticated
          // Only redirect if on login/signup pages or root
          if (currentUrl === '/' || currentUrl.startsWith('/auth/')) {
            // Redirect based on role
            this.keycloakService.getUserRoles().subscribe(roles => {
              const hasAdminRole = roles.some(r => r.toLowerCase() === 'admin');
              if (hasAdminRole) {
                this.router.navigate(['/hello-admin']);
              } else {
                this.router.navigate(['/dashboard']);
              }
            });
          }
          // Otherwise, stay on current page (page refresh case)
        }
      })
      .catch(error => {
        console.error('Error initializing Keycloak', error);
        this.initialized = true;
        // On error, still redirect to login
        this.router.navigate(['/auth/login']);
      });
  }
}
