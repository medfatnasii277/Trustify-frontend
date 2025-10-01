import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { KeycloakService } from '../../core/services/keycloak.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private keycloakService: KeycloakService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]]
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const formData = this.registerForm.value;

      // Call the registration API
      this.registerUser(formData);
    } else {
      this.markFormGroupTouched();
    }
  }

  private async registerUser(userData: any) {
    try {
      // For now, we'll use the direct API call approach
      // This will work once registration is enabled in Keycloak
      const response = await fetch(`${this.keycloakService.getKeycloakUrl()}/realms/${this.keycloakService.getRealm()}/protocol/openid-connect/registrations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.keycloakService.getClientId(),
          username: userData.username,
          password: userData.password,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName
        })
      });

      if (response.ok) {
        // Registration successful, redirect to login
        this.router.navigate(['/auth/login']);
      } else {
        const errorText = await response.text();
        this.errorMessage = `Registration failed: ${response.status} ${response.statusText}`;
        console.error('Registration error:', errorText);
      }
    } catch (error) {
      this.errorMessage = 'Network error occurred. Please try again.';
      console.error('Registration error:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const control = this.registerForm.get(fieldName);
    if (control?.errors && control.touched) {
      if (control.errors['required']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      }
      if (control.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (control.errors['minlength']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${control.errors['minlength'].requiredLength} characters`;
      }
    }
    return '';
  }
}
