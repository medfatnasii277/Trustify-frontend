import { InsurancePolicy } from './insurance-policy.model';

export interface LifeInsurancePolicy extends InsurancePolicy {
  policyType: string;
  includesCriticalIllness: boolean;
  includesDisabilityBenefit: boolean;
  beneficiaryName: string;
  beneficiaryRelationship: string;
}