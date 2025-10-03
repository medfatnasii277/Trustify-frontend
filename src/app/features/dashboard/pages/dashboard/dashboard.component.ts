import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KeycloakService } from '../../../../core/services/keycloak.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class DashboardComponent implements OnInit {
  username = '';
  isAdmin = false;
  isUser = false;
  isLoading = true;

  constructor(
    private keycloakService: KeycloakService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadUserProfile();
    this.checkRoles();
  }

  loadUserProfile(): void {
    this.keycloakService.getUserProfile().subscribe(
      profile => {
        if (profile) {
          this.username = profile.firstName || profile.username || 'User';
          this.isLoading = false;
        }
      },
      error => {
        console.error('Could not load user profile', error);
        this.isLoading = false;
        this.username = 'User';
      }
    );
  }

  checkRoles(): void {
    this.keycloakService.hasRole('ADMIN').subscribe(
      isAdmin => {
        this.isAdmin = isAdmin;
      }
    );

    this.keycloakService.hasRole('USER').subscribe(
      isUser => {
        this.isUser = isUser;
      }
    );
  }

  goToAdminPage(): void {
    this.router.navigate(['/hello-admin']);
  }

  goToUserPage(): void {
    this.router.navigate(['/hello-user']);
  }
  
  goToPolicyPage(): void {
    this.router.navigate(['/policies']);
  }

  logout(): void {
    this.keycloakService.logout()
      .catch(error => console.error('Logout failed', error));
  }
}