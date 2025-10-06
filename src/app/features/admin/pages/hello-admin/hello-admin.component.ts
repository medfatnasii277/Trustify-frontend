import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KeycloakService } from '../../../../core/services/keycloak.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hello-admin',
  templateUrl: './hello-admin.component.html',
  styleUrls: ['./hello-admin.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class HelloAdminComponent implements OnInit {
  username = '';
  isLoading = true;

  constructor(
    private keycloakService: KeycloakService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.keycloakService.getUserProfile().subscribe(
      profile => {
        if (profile) {
          this.username = profile.firstName || profile.username || 'Admin';
          this.isLoading = false;
        }
      },
      error => {
        console.error('Could not load user profile', error);
        this.isLoading = false;
        this.username = 'Admin';
      }
    );
  }

  logout(): void {
    this.keycloakService.logout()
      .catch(error => console.error('Logout failed', error));
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  goToPolicies(): void {
    this.router.navigate(['/admin/policies']);
  }

  goToClaims(): void {
    this.router.navigate(['/admin/claims']);
  }
}