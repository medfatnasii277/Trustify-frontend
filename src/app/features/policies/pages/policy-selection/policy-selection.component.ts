import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-policy-selection',
  standalone: true,
  imports: [CommonModule, RouterModule],
  styleUrls: ['./policy-selection.component.css'],
  template: `
    <div class="container">
      <div class="header">
        <h1>Choose Your Insurance Policy</h1>
        <p>Select the insurance type that best fits your needs and get comprehensive coverage today</p>
      </div>

      <div class="policies-grid">
        <div class="policy-card">
          <div class="policy-icon life-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h2>Life Insurance</h2>
          <p>Protect your family's financial future with comprehensive life insurance coverage</p>
          <ul class="features-list">
            <li>Financial security for dependents</li>
            <li>Critical illness coverage</li>
            <li>Disability benefit options</li>
            <li>Flexible payment plans</li>
          </ul>
          <button class="btn btn-life" [routerLink]="['/policies/life/new']">
            <span>Select Life Insurance</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>

        <div class="policy-card">
          <div class="policy-icon car-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <h2>Car Insurance</h2>
          <p>Drive with confidence knowing your vehicle is fully protected on and off the road</p>
          <ul class="features-list">
            <li>24/7 roadside assistance</li>
            <li>Collision & theft protection</li>
            <li>Rental car coverage</li>
            <li>Accident forgiveness</li>
          </ul>
          <button class="btn btn-car" [routerLink]="['/policies/car/new']">
            <span>Select Car Insurance</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>

        <div class="policy-card">
          <div class="policy-icon house-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <h2>House Insurance</h2>
          <p>Safeguard your home and belongings with comprehensive property insurance coverage</p>
          <ul class="features-list">
            <li>Property damage coverage</li>
            <li>Liability protection</li>
            <li>Natural disaster coverage</li>
            <li>Contents & valuables protection</li>
          </ul>
          <button class="btn btn-house" [routerLink]="['/policies/house/new']">
            <span>Select House Insurance</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>

      <div class="back-button">
        <button class="btn-back" (click)="goBack()">
          ← Back to Dashboard
        </button>
      </div>
    </div>
  `
})
export class PolicySelectionComponent {
  constructor(private router: Router) {}

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
