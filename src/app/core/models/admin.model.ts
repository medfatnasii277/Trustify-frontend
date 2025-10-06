/**
 * Admin-specific models and interfaces
 */

export interface ClaimApprovalRequest {
  claimNumber: string;
  approvedAmount: number;
  adminNotes?: string;
}

export interface ClaimRejectionRequest {
  claimNumber: string;
  rejectionReason: string;
  adminNotes?: string;
}

export interface ClaimStatistics {
  totalClaims: number;
  submittedCount: number;
  underReviewCount: number;
  approvedCount: number;
  rejectedCount: number;
  settledCount: number;
  cancelledCount: number;
  totalClaimedAmount: number;
  totalApprovedAmount: number;
  totalSettledAmount: number;
  averageProcessingTime: number;
}

export interface AdminDashboardStats {
  claims: ClaimStatistics;
  totalPolicies: number;
  activePolicies: number;
  pendingPolicies: number;
}
