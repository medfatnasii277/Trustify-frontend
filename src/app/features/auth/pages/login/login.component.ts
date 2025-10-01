import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { KeycloakService } from '../../../../core/services/keycloak.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ]
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  loginError = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private keycloakService: KeycloakService
  ) { }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  onLogin(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.loginError = '';

      const username = this.loginForm.get('username')?.value;
      const password = this.loginForm.get('password')?.value;

      this.keycloakService.loginWithCredentials(username, password)
        .then(() => {
          this.isLoading = false;
          // Success case is handled by KeycloakService with automatic redirect
        })
        .catch(error => {
          console.error('Login failed', error);
          this.isLoading = false;

          if (error instanceof Error) {
            this.loginError = error.message || 'Authentication failed. Please try again.';
          } else {
            this.loginError = 'Authentication failed. Please try again.';
          }
        });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  onSignup(): void {
    this.router.navigate(['/auth/signup']);
  }
}