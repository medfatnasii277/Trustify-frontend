import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-access-denied',
  template: `
    <div class="access-denied-container">
      <div class="error-content">
        <h1>Access Denied</h1>
        <p>You don't have permission to access this page.</p>
        <button (click)="goHome()" class="home-button">Go to Dashboard</button>
      </div>
    </div>
  `,
  styles: [`
    .access-denied-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background-color: #f5f5f5;
    }
    .error-content {
      text-align: center;
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .home-button {
      background-color: #007bff;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      margin-top: 1rem;
    }
    .home-button:hover {
      background-color: #0056b3;
    }
  `],
  standalone: true,
  imports: [CommonModule]
})
export class AccessDeniedComponent {
  constructor(private router: Router) {}

  goHome(): void {
    this.router.navigate(['/dashboard']);
  }
}