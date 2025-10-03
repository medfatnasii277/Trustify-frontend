import { InsurancePolicy } from './insurance-policy.model';

export interface CarInsurancePolicy extends InsurancePolicy {
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  vehicleVIN: string;
  licensePlate: string;
  coverageType: string;
  includesRoadSideAssistance: boolean;
  includesRentalCarCoverage: boolean;
}