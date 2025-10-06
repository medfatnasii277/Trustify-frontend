import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CarInsurancePolicy } from '../../features/policies/models/car-insurance-policy.model';
import { LifeInsurancePolicy } from '../../features/policies/models/life-insurance-policy.model';
import { HouseInsurancePolicy } from '../../features/policies/models/house-insurance-policy.model';

export type AnyInsurancePolicy = CarInsurancePolicy | LifeInsurancePolicy | HouseInsurancePolicy;

@Injectable({
  providedIn: 'root'
})
export class AdminPolicyService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  /**
   * Get all car insurance policies
   */
  getAllCarPolicies(): Observable<CarInsurancePolicy[]> {
    console.log('AdminPolicyService: Getting all car policies');
    return this.http.get<CarInsurancePolicy[]>(`${this.apiUrl}/policies/car`);
  }

  /**
   * Get all life insurance policies
   */
  getAllLifePolicies(): Observable<LifeInsurancePolicy[]> {
    console.log('AdminPolicyService: Getting all life policies');
    return this.http.get<LifeInsurancePolicy[]>(`${this.apiUrl}/policies/life`);
  }

  /**
   * Get all house insurance policies
   */
  getAllHousePolicies(): Observable<HouseInsurancePolicy[]> {
    console.log('AdminPolicyService: Getting all house policies');
    return this.http.get<HouseInsurancePolicy[]>(`${this.apiUrl}/policies/house`);
  }

  /**
   * Get all policies (all types combined)
   */
  getAllPolicies(): Observable<AnyInsurancePolicy[]> {
    console.log('AdminPolicyService: Getting all policies');
    return forkJoin({
      car: this.getAllCarPolicies(),
      life: this.getAllLifePolicies(),
      house: this.getAllHousePolicies()
    }).pipe(
      map(result => [...result.car, ...result.life, ...result.house] as AnyInsurancePolicy[])
    );
  }

  /**
   * Delete a policy by ID and type
   */
  deletePolicy(id: number, policyType: string): Observable<void> {
    console.log(`AdminPolicyService: Deleting ${policyType} policy:`, id);
    return this.http.delete<void>(`${this.apiUrl}/policies/${policyType.toLowerCase()}/${id}`);
  }
}
