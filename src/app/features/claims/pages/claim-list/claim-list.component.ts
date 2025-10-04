import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ClaimService } from '../../services/claim.service';
import { ClaimResponse, ClaimStatus, PolicyType, getClaimStatusLabel, getClaimStatusColor } from '../../models/claim.model';

@Component({
  selector: 'app-claim-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  styleUrls: ['./claim-list.component.css'],
  template: `
    <div class="container">
      <div class="header">
        <h1>My Insurance Claims</h1>
        <p>View and manage all your insurance claims</p>
      </div>

      <!-- Action Buttons -->
      <div class="action-bar">
        <button class="btn btn-primary" (click)="navigateToSubmitClaim()">
          <span class="icon">+</span> Submit New Claim
        </button>
      </div>

      <!-- Filter Tabs by Status -->
      <div class="filter-tabs">
        <button 
          class="tab" 
          [class.active]="selectedFilter === 'all'"
          (click)="filterClaims('all')">
          All Claims ({{ allClaims.length }})
        </button>
        <button 
          class="tab" 
          [class.active]="selectedFilter === 'SUBMITTED'"
          (click)="filterClaims('SUBMITTED')">
          Submitted ({{ getClaimsByStatus('SUBMITTED').length }})
        </button>
        <button 
          class="tab" 
          [class.active]="selectedFilter === 'UNDER_REVIEW'"
          (click)="filterClaims('UNDER_REVIEW')">
          Under Review ({{ getClaimsByStatus('UNDER_REVIEW').length }})
        </button>
        <button 
          class="tab" 
          [class.active]="selectedFilter === 'APPROVED'"
          (click)="filterClaims('APPROVED')">
          Approved ({{ getClaimsByStatus('APPROVED').length }})
        </button>
        <button 
          class="tab" 
          [class.active]="selectedFilter === 'SETTLED'"
          (click)="filterClaims('SETTLED')">
          Settled ({{ getClaimsByStatus('SETTLED').length }})
        </button>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="loading">
        Loading claims...
      </div>

      <!-- Error Message -->
      <div *ngIf="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <!-- Claims Grid -->
      <div *ngIf="!isLoading && !errorMessage" class="claims-grid">
        <div *ngIf="filteredClaims.length === 0" class="no-claims">
          <p>No claims found</p>
          <button class="btn btn-primary" (click)="navigateToSubmitClaim()">
            Submit Your First Claim
          </button>
        </div>

        <div *ngFor="let claim of filteredClaims" class="claim-card" (click)="viewClaimDetails(claim)">
          <div class="claim-header">
            <span class="claim-type">{{ formatClaimType(claim.claimType) }}</span>
            <span class="claim-status" [style.background-color]="getStatusColor(claim.status)">
              {{ formatStatus(claim.status) }}
            </span>
          </div>
          <div class="claim-body">
            <h3>{{ claim.claimNumber }}</h3>
            <p class="claim-detail"><strong>Policy:</strong> {{ claim.policyNumber }} ({{ claim.policyType }})</p>
            <p class="claim-detail"><strong>Claimed Amount:</strong> {{ claim.claimedAmount | currency }}</p>
            <p class="claim-detail" *ngIf="claim.approvedAmount">
              <strong>Approved Amount:</strong> {{ claim.approvedAmount | currency }}
            </p>
            <p class="claim-detail"><strong>Incident Date:</strong> {{ claim.incidentDate | date }}</p>
            <p class="claim-detail"><strong>Submitted:</strong> {{ claim.submittedDate | date }}</p>
            <p class="claim-detail" *ngIf="claim.severity">
              <strong>Severity:</strong> 
              <span class="severity-badge" [class]="'severity-' + claim.severity.toLowerCase()">
                {{ claim.severity }}
              </span>
            </p>
            <p class="claim-description">{{ claim.description }}</p>
          </div>
          <div class="claim-footer" *ngIf="claim.status === 'SUBMITTED' || claim.status === 'UNDER_REVIEW'">
            <button class="btn-cancel" (click)="cancelClaim(claim.claimNumber, $event)">
              Cancel Claim
            </button>
          </div>
        </div>
      </div>

      <!-- Back Button -->
      <div class="actions">
        <button class="btn btn-secondary" (click)="navigateToDashboard()">
          Back to Dashboard
        </button>
      </div>

      <!-- Claim Details Modal -->
      <div *ngIf="selectedClaim" class="modal-overlay" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Claim Details</h2>
            <button class="close-btn" (click)="closeModal()">×</button>
          </div>
          <div class="modal-body">
            <!-- General Information -->
            <div class="detail-section">
              <h3>General Information</h3>
              <div class="detail-row">
                <span class="label">Claim Number:</span>
                <span class="value">{{ selectedClaim.claimNumber }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Policy Number:</span>
                <span class="value">{{ selectedClaim.policyNumber }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Policy Type:</span>
                <span class="value">{{ selectedClaim.policyType }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Claim Type:</span>
                <span class="value">{{ formatClaimType(selectedClaim.claimType) }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Status:</span>
                <span class="value badge" [style.background-color]="getStatusColor(selectedClaim.status)">
                  {{ formatStatus(selectedClaim.status) }}
                </span>
              </div>
              <div class="detail-row" *ngIf="selectedClaim.severity">
                <span class="label">Severity:</span>
                <span class="value severity-badge" [class]="'severity-' + selectedClaim.severity.toLowerCase()">
                  {{ selectedClaim.severity }}
                </span>
              </div>
            </div>

            <!-- Financial Information -->
            <div class="detail-section">
              <h3>Financial Details</h3>
              <div class="detail-row">
                <span class="label">Claimed Amount:</span>
                <span class="value">{{ selectedClaim.claimedAmount | currency }}</span>
              </div>
              <div class="detail-row" *ngIf="selectedClaim.approvedAmount">
                <span class="label">Approved Amount:</span>
                <span class="value">{{ selectedClaim.approvedAmount | currency }}</span>
              </div>
            </div>

            <!-- Incident Information -->
            <div class="detail-section">
              <h3>Incident Details</h3>
              <div class="detail-row">
                <span class="label">Incident Date:</span>
                <span class="value">{{ selectedClaim.incidentDate | date:'fullDate' }}</span>
              </div>
              <div class="detail-row" *ngIf="selectedClaim.incidentLocation">
                <span class="label">Location:</span>
                <span class="value">{{ selectedClaim.incidentLocation }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Description:</span>
                <span class="value">{{ selectedClaim.description }}</span>
              </div>
            </div>

            <!-- Timeline -->
            <div class="detail-section">
              <h3>Timeline</h3>
              <div class="detail-row">
                <span class="label">Submitted:</span>
                <span class="value">{{ selectedClaim.submittedDate | date:'fullDate' }}</span>
              </div>
              <div class="detail-row" *ngIf="selectedClaim.approvedDate">
                <span class="label">Approved:</span>
                <span class="value">{{ selectedClaim.approvedDate | date:'fullDate' }}</span>
              </div>
              <div class="detail-row" *ngIf="selectedClaim.rejectedDate">
                <span class="label">Rejected:</span>
                <span class="value">{{ selectedClaim.rejectedDate | date:'fullDate' }}</span>
              </div>
              <div class="detail-row" *ngIf="selectedClaim.settledDate">
                <span class="label">Settled:</span>
                <span class="value">{{ selectedClaim.settledDate | date:'fullDate' }}</span>
              </div>
            </div>

            <!-- Admin Information -->
            <div class="detail-section" *ngIf="selectedClaim.rejectionReason || selectedClaim.adminNotes || selectedClaim.reviewedBy">
              <h3>Review Information</h3>
              <div class="detail-row" *ngIf="selectedClaim.reviewedBy">
                <span class="label">Reviewed By:</span>
                <span class="value">{{ selectedClaim.reviewedBy }}</span>
              </div>
              <div class="detail-row" *ngIf="selectedClaim.rejectionReason">
                <span class="label">Rejection Reason:</span>
                <span class="value alert">{{ selectedClaim.rejectionReason }}</span>
              </div>
              <div class="detail-row" *ngIf="selectedClaim.adminNotes">
                <span class="label">Admin Notes:</span>
                <span class="value">{{ selectedClaim.adminNotes }}</span>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="closeModal()">Close</button>
            <button 
              *ngIf="selectedClaim.status === 'SUBMITTED' || selectedClaim.status === 'UNDER_REVIEW'"
              class="btn btn-danger" 
              (click)="cancelClaim(selectedClaim.claimNumber, $event)">
              Cancel Claim
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ClaimListComponent implements OnInit {
  private claimService = inject(ClaimService);
  private router = inject(Router);

  allClaims: ClaimResponse[] = [];
  filteredClaims: ClaimResponse[] = [];
  selectedFilter: string = 'all';
  selectedClaim: ClaimResponse | null = null;
  
  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadClaims();
  }

  loadClaims(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.claimService.getMyClaims().subscribe({
      next: (claims) => {
        this.allClaims = claims;
        this.filteredClaims = claims;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load claims. Please try again.';
        console.error('Error loading claims:', error);
        this.isLoading = false;
      }
    });
  }

  filterClaims(filter: string): void {
    this.selectedFilter = filter;
    if (filter === 'all') {
      this.filteredClaims = this.allClaims;
    } else {
      this.filteredClaims = this.allClaims.filter(claim => claim.status === filter);
    }
  }

  getClaimsByStatus(status: string): ClaimResponse[] {
    return this.allClaims.filter(claim => claim.status === status);
  }

  viewClaimDetails(claim: ClaimResponse): void {
    this.selectedClaim = claim;
  }

  closeModal(): void {
    this.selectedClaim = null;
  }

  cancelClaim(claimNumber: string, event: Event): void {
    event.stopPropagation();
    
    if (!confirm('Are you sure you want to cancel this claim? This action cannot be undone.')) {
      return;
    }

    this.claimService.cancelClaim(claimNumber).subscribe({
      next: () => {
        this.loadClaims();
        this.closeModal();
      },
      error: (error) => {
        alert('Failed to cancel claim. Please try again.');
        console.error('Error canceling claim:', error);
      }
    });
  }

  formatStatus(status: ClaimStatus): string {
    return getClaimStatusLabel(status);
  }

  getStatusColor(status: ClaimStatus): string {
    return getClaimStatusColor(status);
  }

  formatClaimType(claimType: string): string {
    return claimType.replace(/_/g, ' ').replace(/CLAIM/g, '').trim();
  }

  navigateToSubmitClaim(): void {
    this.router.navigate(['/claims/submit']);
  }

  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
