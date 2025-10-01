import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KeycloakService } from '../../../../core/services/keycloak.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hello-user',
  templateUrl: './hello-user.component.html',
  styleUrls: ['./hello-user.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class HelloUserComponent implements OnInit {
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

  logout(): void {
    this.keycloakService.logout()
      .catch(error => console.error('Logout failed', error));
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}