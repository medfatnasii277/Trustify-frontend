import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { CarInsurancePolicy, HouseInsurancePolicy, LifeInsurancePolicy } from '../models';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PolicyService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/policies`;

  // Life Insurance APIs
  createLifePolicy(policy: LifeInsurancePolicy): Observable<LifeInsurancePolicy> {
    return this.http.post<LifeInsurancePolicy>(`${this.baseUrl}/life`, policy);
  }

  updateLifePolicy(id: number, policy: LifeInsurancePolicy): Observable<LifeInsurancePolicy> {
    return this.http.put<LifeInsurancePolicy>(`${this.baseUrl}/life/${id}`, policy);
  }

  getLifePolicy(id: number): Observable<LifeInsurancePolicy> {
    return this.http.get<LifeInsurancePolicy>(`${this.baseUrl}/life/${id}`);
  }

  getMyLifePolicies(): Observable<LifeInsurancePolicy[]> {
    return this.http.get<LifeInsurancePolicy[]>(`${this.baseUrl}/life/me`);
  }

  // Car Insurance APIs
  createCarPolicy(policy: CarInsurancePolicy): Observable<CarInsurancePolicy> {
    return this.http.post<CarInsurancePolicy>(`${this.baseUrl}/car`, policy);
  }

  updateCarPolicy(id: number, policy: CarInsurancePolicy): Observable<CarInsurancePolicy> {
    return this.http.put<CarInsurancePolicy>(`${this.baseUrl}/car/${id}`, policy);
  }

  getCarPolicy(id: number): Observable<CarInsurancePolicy> {
    return this.http.get<CarInsurancePolicy>(`${this.baseUrl}/car/${id}`);
  }

  getMyCarPolicies(): Observable<CarInsurancePolicy[]> {
    return this.http.get<CarInsurancePolicy[]>(`${this.baseUrl}/car/me`);
  }

  // House Insurance APIs
  createHousePolicy(policy: HouseInsurancePolicy): Observable<HouseInsurancePolicy> {
    return this.http.post<HouseInsurancePolicy>(`${this.baseUrl}/house`, policy);
  }

  updateHousePolicy(id: number, policy: HouseInsurancePolicy): Observable<HouseInsurancePolicy> {
    return this.http.put<HouseInsurancePolicy>(`${this.baseUrl}/house/${id}`, policy);
  }

  getHousePolicy(id: number): Observable<HouseInsurancePolicy> {
    return this.http.get<HouseInsurancePolicy>(`${this.baseUrl}/house/${id}`);
  }

  getMyHousePolicies(): Observable<HouseInsurancePolicy[]> {
    return this.http.get<HouseInsurancePolicy[]>(`${this.baseUrl}/house/me`);
  }
}