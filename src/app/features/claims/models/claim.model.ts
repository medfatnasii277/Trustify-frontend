// Enums matching backend
export enum ClaimStatus {
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SETTLED = 'SETTLED',
  CANCELLED = 'CANCELLED'
}

export enum ClaimType {
  // Life Insurance Claims
  DEATH_CLAIM = 'DEATH_CLAIM',
  CRITICAL_ILLNESS_CLAIM = 'CRITICAL_ILLNESS_CLAIM',
  DISABILITY_CLAIM = 'DISABILITY_CLAIM',
  ACCIDENT_CLAIM = 'ACCIDENT_CLAIM',
  
  // Car Insurance Claims
  THEFT_CLAIM = 'THEFT_CLAIM',
  NATURAL_DISASTER_CAR_CLAIM = 'NATURAL_DISASTER_CAR_CLAIM',
  VANDALISM_CLAIM = 'VANDALISM_CLAIM',
  
  // House Insurance Claims
  FIRE_DAMAGE_CLAIM = 'FIRE_DAMAGE_CLAIM',
  WATER_DAMAGE_CLAIM = 'WATER_DAMAGE_CLAIM',
  THEFT_HOME_CLAIM = 'THEFT_HOME_CLAIM',
  NATURAL_DISASTER_HOME_CLAIM = 'NATURAL_DISASTER_HOME_CLAIM',
  LIABILITY_CLAIM = 'LIABILITY_CLAIM',
  
  // Other
  OTHER = 'OTHER'
}

export enum PolicyType {
  LIFE = 'LIFE',
  CAR = 'CAR',
  HOUSE = 'HOUSE'
}

export enum Severity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

// Request DTO matching backend ClaimRequest
export interface ClaimRequest {
  policyNumber: string;
  policyType: PolicyType;
  claimType: ClaimType;
  incidentDate: string; // ISO date string
  claimedAmount: number;
  description: string;
  incidentLocation?: string;
  documentsPath?: string;
  severity?: Severity;
}

// Response DTO matching backend ClaimResponse
export interface ClaimResponse {
  id: number;
  claimNumber: string;
  policyNumber: string;
  policyType: PolicyType;
  claimType: ClaimType;
  status: ClaimStatus;
  incidentDate: string;
  submittedDate: string;
  approvedDate?: string;
  rejectedDate?: string;
  settledDate?: string;
  claimedAmount: number;
  approvedAmount?: number;
  description: string;
  incidentLocation?: string;
  rejectionReason?: string;
  adminNotes?: string;
  documentsPath?: string;
  reviewedBy?: string;
  severity?: Severity;
  createdAt: string;
  updatedAt: string;
}

// Helper functions
export function getClaimTypesByPolicy(policyType: PolicyType): ClaimType[] {
  switch (policyType) {
    case PolicyType.LIFE:
      return [
        ClaimType.DEATH_CLAIM,
        ClaimType.CRITICAL_ILLNESS_CLAIM,
        ClaimType.DISABILITY_CLAIM,
        ClaimType.ACCIDENT_CLAIM
      ];
    case PolicyType.CAR:
      return [
        ClaimType.ACCIDENT_CLAIM,
        ClaimType.THEFT_CLAIM,
        ClaimType.NATURAL_DISASTER_CAR_CLAIM,
        ClaimType.VANDALISM_CLAIM
      ];
    case PolicyType.HOUSE:
      return [
        ClaimType.FIRE_DAMAGE_CLAIM,
        ClaimType.WATER_DAMAGE_CLAIM,
        ClaimType.THEFT_HOME_CLAIM,
        ClaimType.NATURAL_DISASTER_HOME_CLAIM,
        ClaimType.LIABILITY_CLAIM
      ];
    default:
      return [ClaimType.OTHER];
  }
}

export function getClaimTypeLabel(claimType: ClaimType): string {
  return claimType.replace(/_/g, ' ').replace(/CLAIM/g, '').trim();
}

export function getClaimStatusLabel(status: ClaimStatus): string {
  return status.replace(/_/g, ' ');
}

export function getClaimStatusColor(status: ClaimStatus): string {
  switch (status) {
    case ClaimStatus.SUBMITTED:
      return '#3b82f6'; // Blue
    case ClaimStatus.UNDER_REVIEW:
      return '#f59e0b'; // Amber
    case ClaimStatus.APPROVED:
      return '#10b981'; // Green
    case ClaimStatus.REJECTED:
      return '#ef4444'; // Red
    case ClaimStatus.SETTLED:
      return '#8b5cf6'; // Purple
    case ClaimStatus.CANCELLED:
      return '#6b7280'; // Gray
    default:
      return '#6b7280';
  }
}
