import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminClaimService } from '../../../../core/services/admin-claim.service';
import { ClaimResponse, ClaimStatus } from '../../../claims/models/claim.model';
import { ClaimApprovalRequest, ClaimRejectionRequest } from '../../../../core/models/admin.model';

@Component({
  selector: 'app-admin-claims',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-claims.component.html',
  styleUrls: ['./admin-claims.component.css']
})
export class AdminClaimsComponent implements OnInit {
  private adminClaimService = inject(AdminClaimService);
  private router = inject(Router);

  claims: ClaimResponse[] = [];
  filteredClaims: ClaimResponse[] = [];
  isLoading = true;
  errorMessage = '';
  successMessage = '';

  // Filter options
  statusFilter: string = 'ALL';
  searchTerm: string = '';
  
  // Claim statuses
  ClaimStatus = ClaimStatus;
  statuses = Object.values(ClaimStatus);

  // Selected claim for modal actions
  selectedClaim: ClaimResponse | null = null;
  showApprovalModal = false;
  showRejectionModal = false;

  // Approval form
  approvedAmount: number = 0;
  adminNotes: string = '';

  // Rejection form
  rejectionReason: string = '';

  ngOnInit(): void {
    this.loadClaims();
  }

  loadClaims(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.adminClaimService.getAllClaims().subscribe({
      next: (claims) => {
        this.claims = claims;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading claims:', error);
        this.errorMessage = 'Failed to load claims. Please try again.';
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.claims];

    // Apply status filter
    if (this.statusFilter !== 'ALL') {
      filtered = filtered.filter(claim => claim.status === this.statusFilter);
    }

    // Apply search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(claim =>
        claim.claimNumber.toLowerCase().includes(term) ||
        claim.claimType.toLowerCase().includes(term) ||
        claim.description?.toLowerCase().includes(term)
      );
    }

    this.filteredClaims = filtered;
  }

  onStatusFilterChange(): void {
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'SUBMITTED': 'status-submitted',
      'UNDER_REVIEW': 'status-review',
      'APPROVED': 'status-approved',
      'REJECTED': 'status-rejected',
      'SETTLED': 'status-settled',
      'CANCELLED': 'status-cancelled'
    };
    return statusMap[status] || 'status-default';
  }

  moveToReview(claim: ClaimResponse): void {
    if (!confirm(`Move claim ${claim.claimNumber} to Under Review?`)) {
      return;
    }

    this.adminClaimService.moveToUnderReview(claim.claimNumber).subscribe({
      next: (updatedClaim) => {
        this.successMessage = `Claim ${claim.claimNumber} moved to Under Review`;
        this.updateClaimInList(updatedClaim);
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to update claim status';
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  openApprovalModal(claim: ClaimResponse): void {
    this.selectedClaim = claim;
    this.approvedAmount = claim.claimedAmount;
    this.adminNotes = '';
    this.showApprovalModal = true;
  }

  closeApprovalModal(): void {
    this.showApprovalModal = false;
    this.selectedClaim = null;
    this.approvedAmount = 0;
    this.adminNotes = '';
  }

  approveClaim(): void {
    if (!this.selectedClaim) return;

    const request: ClaimApprovalRequest = {
      claimNumber: this.selectedClaim.claimNumber,
      approvedAmount: this.approvedAmount,
      adminNotes: this.adminNotes
    };

    this.adminClaimService.approveClaim(request).subscribe({
      next: (updatedClaim) => {
        this.successMessage = `Claim ${this.selectedClaim!.claimNumber} approved successfully`;
        this.updateClaimInList(updatedClaim);
        this.closeApprovalModal();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to approve claim';
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  openRejectionModal(claim: ClaimResponse): void {
    this.selectedClaim = claim;
    this.rejectionReason = '';
    this.adminNotes = '';
    this.showRejectionModal = true;
  }

  closeRejectionModal(): void {
    this.showRejectionModal = false;
    this.selectedClaim = null;
    this.rejectionReason = '';
    this.adminNotes = '';
  }

  rejectClaim(): void {
    if (!this.selectedClaim) return;

    const request: ClaimRejectionRequest = {
      claimNumber: this.selectedClaim.claimNumber,
      rejectionReason: this.rejectionReason,
      adminNotes: this.adminNotes
    };

    this.adminClaimService.rejectClaim(request).subscribe({
      next: (updatedClaim) => {
        this.successMessage = `Claim ${this.selectedClaim!.claimNumber} rejected`;
        this.updateClaimInList(updatedClaim);
        this.closeRejectionModal();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to reject claim';
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  settleClaim(claim: ClaimResponse): void {
    if (!confirm(`Mark claim ${claim.claimNumber} as Settled (Paid)?`)) {
      return;
    }

    this.adminClaimService.settleClaim(claim.claimNumber).subscribe({
      next: (updatedClaim) => {
        this.successMessage = `Claim ${claim.claimNumber} marked as settled`;
        this.updateClaimInList(updatedClaim);
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to settle claim';
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  private updateClaimInList(updatedClaim: ClaimResponse): void {
    const index = this.claims.findIndex(c => c.claimNumber === updatedClaim.claimNumber);
    if (index !== -1) {
      this.claims[index] = updatedClaim;
      this.applyFilters();
    }
  }

  back(): void {
    this.router.navigate(['/hello-admin']);
  }
}
