export enum PolicyStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED'
}

export enum PaymentFrequency {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  SEMI_ANNUALLY = 'SEMI_ANNUALLY',
  ANNUALLY = 'ANNUALLY'
}

export interface InsurancePolicy {
  id?: number;
  policyNumber?: string;
  userProfileId?: number;
  startDate: Date;
  endDate: Date;
  status?: PolicyStatus;
  premiumAmount?: number;
  paymentFrequency: PaymentFrequency;
  coverageAmount: number;
  description?: string;
}