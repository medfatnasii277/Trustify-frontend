import { InsurancePolicy } from './insurance-policy.model';

export interface HouseInsurancePolicy extends InsurancePolicy {
  propertyAddress: string;
  propertyType: string;
  yearBuilt: number;
  propertyValue: number;
  contentsValue: number;
  coverageType: string;
  includesFloodCoverage: boolean;
  includesEarthquakeCoverage: boolean;
  includesLiabilityCoverage: boolean;
}