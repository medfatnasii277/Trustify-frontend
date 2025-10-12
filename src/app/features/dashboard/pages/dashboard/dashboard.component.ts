import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KeycloakService } from '../../../../core/services/keycloak.service';
import { Router, RouterModule } from '@angular/router';
import { NotificationBellComponent } from '../../../../shared/components/notification-bell/notification-bell.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, NotificationBellComponent]
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
    
    // Set a timeout to stop loading after 2 seconds even if profile doesn't load
    setTimeout(() => {
      if (this.isLoading) {
        console.warn('Dashboard loading timeout - setting default username');
        this.username = 'User';
        this.isLoading = false;
      }
    }, 2000);
  }

  loadUserProfile(): void {
    this.keycloakService.getUserProfile().subscribe({
      next: (profile) => {
        console.log('User profile received:', profile);
        if (profile) {
          this.username = profile.firstName || profile.username || 'User';
          this.isLoading = false;
        } else {
          // Profile is null, try to get username from token
          console.log('Profile is null, using fallback');
          this.username = 'User';
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Could not load user profile', error);
        this.isLoading = false;
        this.username = 'User';
      }
    });
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

  goToMyPolicies(): void {
    this.router.navigate(['/policies/list']);
  }

  goToMyClaims(): void {
    this.router.navigate(['/claims/list']);
  }

  goToSubmitClaim(): void {
    this.router.navigate(['/claims/submit']);
  }

  logout(): void {
    this.keycloakService.logout()
      .catch(error => console.error('Logout failed', error));
  }
}