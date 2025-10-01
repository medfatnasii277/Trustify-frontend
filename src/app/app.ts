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
        if (!authenticated) {
          // User is not authenticated, redirect to login
          this.router.navigate(['/auth/login']);
        } else {
          // User is authenticated, KeycloakService will handle role-based redirection
          // The redirectBasedOnRole is called in loginWithCredentials
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
