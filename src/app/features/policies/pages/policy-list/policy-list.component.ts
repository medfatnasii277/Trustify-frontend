import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { PolicyService } from '../../services/policy.service';

@Component({
  selector: 'app-policy-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  styleUrls: ['./policy-list.component.css'],
  template: `
    <div class="container">
      <div class="header">
        <h1>My Insurance Policies</h1>
        <p>View and manage all your insurance policies</p>
      </div>

      <!-- Filter Tabs -->
      <div class="filter-tabs">
        <button 
          class="tab" 
          [class.active]="selectedFilter === 'all'"
          (click)="filterPolicies('all')">
          All Policies ({{ allPolicies.length }})
        </button>
        <button 
          class="tab" 
          [class.active]="selectedFilter === 'life'"
          (click)="filterPolicies('life')">
          Life Insurance ({{ lifePolicies.length }})
        </button>
        <button 
          class="tab" 
          [class.active]="selectedFilter === 'car'"
          (click)="filterPolicies('car')">
          Car Insurance ({{ carPolicies.length }})
        </button>
        <button 
          class="tab" 
          [class.active]="selectedFilter === 'house'"
          (click)="filterPolicies('house')">
          House Insurance ({{ housePolicies.length }})
        </button>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="loading">
        Loading policies...
      </div>

      <!-- Error Message -->
      <div *ngIf="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <!-- Policies Grid -->
      <div *ngIf="!isLoading && !errorMessage" class="policies-grid">
        <div *ngIf="filteredPolicies.length === 0" class="no-policies">
          <p>No policies found</p>
          <button class="btn btn-primary" (click)="navigateToSelection()">
            Get Started
          </button>
        </div>

        <div *ngFor="let policy of filteredPolicies" class="policy-card" (click)="viewPolicyDetails(policy)">
          <div class="policy-header">
            <span class="policy-type">{{ policy.type }}</span>
            <span class="policy-status" [class]="'status-' + policy.status.toLowerCase()">
              {{ policy.status }}
            </span>
          </div>
          <div class="policy-body">
            <h3>{{ policy.policyNumber }}</h3>
            <p class="policy-detail"><strong>Coverage:</strong> {{ policy.coverageAmount | currency }}</p>
            <p class="policy-detail"><strong>Payment:</strong> {{ policy.paymentFrequency }}</p>
            <p class="policy-detail"><strong>Start Date:</strong> {{ policy.startDate | date }}</p>
            <p class="policy-detail"><strong>End Date:</strong> {{ policy.endDate | date }}</p>
            
            <!-- Type-specific details -->
            <div *ngIf="policy.type === 'LIFE'" class="extra-details">
              <p><strong>Policy Type:</strong> {{ policy.policyType }}</p>
              <p><strong>Beneficiary:</strong> {{ policy.beneficiaryName }}</p>
            </div>
            <div *ngIf="policy.type === 'CAR'" class="extra-details">
              <p><strong>Vehicle:</strong> {{ policy.vehicleYear }} {{ policy.vehicleMake }} {{ policy.vehicleModel }}</p>
              <p><strong>License Plate:</strong> {{ policy.licensePlate }}</p>
            </div>
            <div *ngIf="policy.type === 'HOUSE'" class="extra-details">
              <p><strong>Property:</strong> {{ policy.propertyType }}</p>
              <p><strong>Property Value:</strong> {{ policy.propertyValue | currency }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Back Button -->
      <div class="actions">
        <button class="btn btn-secondary" (click)="navigateToDashboard()">
          Back to Dashboard
        </button>
      </div>

      <!-- Policy Details Modal -->
      <div *ngIf="selectedPolicy" class="modal-overlay" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Policy Details</h2>
            <button class="close-btn" (click)="closeModal()">×</button>
          </div>
          <div class="modal-body">
            <!-- Common Details -->
            <div class="detail-section">
              <h3>General Information</h3>
              <div class="detail-row">
                <span class="label">Policy Number:</span>
                <span class="value">{{ selectedPolicy.policyNumber }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Policy Type:</span>
                <span class="value">{{ selectedPolicy.type }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Status:</span>
                <span class="value badge" [class]="'status-' + selectedPolicy.status.toLowerCase()">
                  {{ selectedPolicy.status }}
                </span>
              </div>
              <div class="detail-row">
                <span class="label">Coverage Amount:</span>
                <span class="value">{{ selectedPolicy.coverageAmount | currency }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Payment Frequency:</span>
                <span class="value">{{ selectedPolicy.paymentFrequency }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Start Date:</span>
                <span class="value">{{ selectedPolicy.startDate | date:'fullDate' }}</span>
              </div>
              <div class="detail-row">
                <span class="label">End Date:</span>
                <span class="value">{{ selectedPolicy.endDate | date:'fullDate' }}</span>
              </div>
              <div class="detail-row" *ngIf="selectedPolicy.description">
                <span class="label">Description:</span>
                <span class="value">{{ selectedPolicy.description }}</span>
              </div>
            </div>

            <!-- Life Insurance Details -->
            <div *ngIf="selectedPolicy.type === 'LIFE'" class="detail-section">
              <h3>Life Insurance Details</h3>
              <div class="detail-row">
                <span class="label">Policy Type:</span>
                <span class="value">{{ selectedPolicy.policyType }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Critical Illness Coverage:</span>
                <span class="value">{{ selectedPolicy.includesCriticalIllness ? 'Yes' : 'No' }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Disability Benefit:</span>
                <span class="value">{{ selectedPolicy.includesDisabilityBenefit ? 'Yes' : 'No' }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Beneficiary Name:</span>
                <span class="value">{{ selectedPolicy.beneficiaryName }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Beneficiary Relationship:</span>
                <span class="value">{{ selectedPolicy.beneficiaryRelationship }}</span>
              </div>
            </div>

            <!-- Car Insurance Details -->
            <div *ngIf="selectedPolicy.type === 'CAR'" class="detail-section">
              <h3>Car Insurance Details</h3>
              <div class="detail-row">
                <span class="label">Vehicle Make:</span>
                <span class="value">{{ selectedPolicy.vehicleMake }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Vehicle Model:</span>
                <span class="value">{{ selectedPolicy.vehicleModel }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Vehicle Year:</span>
                <span class="value">{{ selectedPolicy.vehicleYear }}</span>
              </div>
              <div class="detail-row">
                <span class="label">VIN:</span>
                <span class="value">{{ selectedPolicy.vehicleVIN }}</span>
              </div>
              <div class="detail-row">
                <span class="label">License Plate:</span>
                <span class="value">{{ selectedPolicy.licensePlate }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Coverage Type:</span>
                <span class="value">{{ selectedPolicy.coverageType }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Roadside Assistance:</span>
                <span class="value">{{ selectedPolicy.includesRoadSideAssistance ? 'Yes' : 'No' }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Rental Car Coverage:</span>
                <span class="value">{{ selectedPolicy.includesRentalCarCoverage ? 'Yes' : 'No' }}</span>
              </div>
            </div>

            <!-- House Insurance Details -->
            <div *ngIf="selectedPolicy.type === 'HOUSE'" class="detail-section">
              <h3>House Insurance Details</h3>
              <div class="detail-row">
                <span class="label">Property Address:</span>
                <span class="value">{{ selectedPolicy.propertyAddress }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Property Type:</span>
                <span class="value">{{ selectedPolicy.propertyType }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Year Built:</span>
                <span class="value">{{ selectedPolicy.yearBuilt }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Property Value:</span>
                <span class="value">{{ selectedPolicy.propertyValue | currency }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Contents Value:</span>
                <span class="value">{{ selectedPolicy.contentsValue | currency }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Coverage Type:</span>
                <span class="value">{{ selectedPolicy.coverageType }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Flood Coverage:</span>
                <span class="value">{{ selectedPolicy.includesFloodCoverage ? 'Yes' : 'No' }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Earthquake Coverage:</span>
                <span class="value">{{ selectedPolicy.includesEarthquakeCoverage ? 'Yes' : 'No' }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Liability Coverage:</span>
                <span class="value">{{ selectedPolicy.includesLiabilityCoverage ? 'Yes' : 'No' }}</span>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="closeModal()">Close</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PolicyListComponent implements OnInit {
  private router = inject(Router);
  private policyService = inject(PolicyService);

  lifePolicies: any[] = [];
  carPolicies: any[] = [];
  housePolicies: any[] = [];
  allPolicies: any[] = [];
  filteredPolicies: any[] = [];
  selectedPolicy: any = null;
  
  selectedFilter: 'all' | 'life' | 'car' | 'house' = 'all';
  isLoading = false;
  errorMessage = '';

  ngOnInit() {
    this.loadPolicies();
  }

  loadPolicies() {
    this.isLoading = true;
    this.errorMessage = '';

    // Load all policy types
    this.policyService.getMyLifePolicies().subscribe({
      next: (policies) => {
        this.lifePolicies = policies.map(p => ({ ...p, type: 'LIFE' }));
        this.updateAllPolicies();
      },
      error: (error) => {
        console.error('Error loading life policies:', error);
      }
    });

    this.policyService.getMyCarPolicies().subscribe({
      next: (policies) => {
        this.carPolicies = policies.map(p => ({ ...p, type: 'CAR' }));
        this.updateAllPolicies();
      },
      error: (error) => {
        console.error('Error loading car policies:', error);
      }
    });

    this.policyService.getMyHousePolicies().subscribe({
      next: (policies) => {
        this.housePolicies = policies.map(p => ({ ...p, type: 'HOUSE' }));
        this.updateAllPolicies();
      },
      error: (error) => {
        console.error('Error loading house policies:', error);
      }
    });

    // Set loading to false after a short delay to allow all requests to complete
    setTimeout(() => {
      this.isLoading = false;
      if (this.allPolicies.length === 0 && !this.errorMessage) {
        this.errorMessage = '';
      }
    }, 1000);
  }

  updateAllPolicies() {
    this.allPolicies = [
      ...this.lifePolicies,
      ...this.carPolicies,
      ...this.housePolicies
    ];
    this.filterPolicies(this.selectedFilter);
  }

  filterPolicies(type: 'all' | 'life' | 'car' | 'house') {
    this.selectedFilter = type;
    
    if (type === 'all') {
      this.filteredPolicies = this.allPolicies;
    } else if (type === 'life') {
      this.filteredPolicies = this.lifePolicies;
    } else if (type === 'car') {
      this.filteredPolicies = this.carPolicies;
    } else if (type === 'house') {
      this.filteredPolicies = this.housePolicies;
    }
  }

  navigateToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  navigateToSelection() {
    this.router.navigate(['/policies/select']);
  }

  viewPolicyDetails(policy: any) {
    this.selectedPolicy = policy;
  }

  closeModal() {
    this.selectedPolicy = null;
  }
}
