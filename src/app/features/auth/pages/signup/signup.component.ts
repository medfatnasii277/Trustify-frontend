import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { KeycloakService } from '../../../../core/services/keycloak.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class SignupComponent {
  isLoading = false;

  constructor(
    private router: Router,
    private keycloakService: KeycloakService
  ) { }

  onSignup(): void {
    this.isLoading = true;

    try {
      // Redirect to Keycloak's themed registration page
      this.keycloakService.register()
        .catch(error => {
          console.error('Registration failed', error);
          this.isLoading = false;
        });
    } catch (e) {
      console.error('Exception during registration', e);
      this.isLoading = false;
    }
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}