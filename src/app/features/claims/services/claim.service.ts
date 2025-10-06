import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ClaimRequest, ClaimResponse, ClaimStatus, PolicyType } from '../models/claim.model';

@Injectable({
  providedIn: 'root'
})
export class ClaimService {
  private http = inject(HttpClient);
  // Use gateway URL - gateway will route to claims-service
  private apiUrl = environment.apiUrl;

  // User endpoints
  submitClaim(request: ClaimRequest): Observable<ClaimResponse> {
    return this.http.post<ClaimResponse>(`${this.apiUrl}/claims`, request);
  }

  getMyClaims(): Observable<ClaimResponse[]> {
    return this.http.get<ClaimResponse[]>(`${this.apiUrl}/claims/my-claims`);
  }

  getClaimByNumber(claimNumber: string): Observable<ClaimResponse> {
    return this.http.get<ClaimResponse>(`${this.apiUrl}/claims/${claimNumber}`);
  }

  getMyClaimsByStatus(status: ClaimStatus): Observable<ClaimResponse[]> {
    return this.http.get<ClaimResponse[]>(`${this.apiUrl}/claims/my-claims/status/${status}`);
  }

  getMyClaimsByPolicyType(policyType: PolicyType): Observable<ClaimResponse[]> {
    return this.http.get<ClaimResponse[]>(`${this.apiUrl}/claims/my-claims/policy-type/${policyType}`);
  }

  getMyClaimsByPolicyNumber(policyNumber: string): Observable<ClaimResponse[]> {
    return this.http.get<ClaimResponse[]>(`${this.apiUrl}/claims/my-claims/policy/${policyNumber}`);
  }

  cancelClaim(claimNumber: string): Observable<ClaimResponse> {
    return this.http.patch<ClaimResponse>(`${this.apiUrl}/claims/${claimNumber}/cancel`, {});
  }

  // Admin endpoints
  getAllClaims(): Observable<ClaimResponse[]> {
    return this.http.get<ClaimResponse[]>(`${this.apiUrl}/admin/claims`);
  }

  getClaimsByStatus(status: ClaimStatus): Observable<ClaimResponse[]> {
    return this.http.get<ClaimResponse[]>(`${this.apiUrl}/admin/claims/status/${status}`);
  }

  moveToUnderReview(claimNumber: string): Observable<ClaimResponse> {
    return this.http.patch<ClaimResponse>(`${this.apiUrl}/admin/claims/${claimNumber}/under-review`, {});
  }

  approveClaim(claimNumber: string, approvedAmount: number, adminNotes?: string): Observable<ClaimResponse> {
    const request = { approvedAmount, adminNotes };
    return this.http.patch<ClaimResponse>(`${this.apiUrl}/admin/claims/${claimNumber}/approve`, request);
  }

  rejectClaim(claimNumber: string, rejectionReason: string, adminNotes?: string): Observable<ClaimResponse> {
    const request = { rejectionReason, adminNotes };
    return this.http.patch<ClaimResponse>(`${this.apiUrl}/admin/claims/${claimNumber}/reject`, request);
  }

  settleClaim(claimNumber: string, adminNotes?: string): Observable<ClaimResponse> {
    const request = { adminNotes };
    return this.http.patch<ClaimResponse>(`${this.apiUrl}/admin/claims/${claimNumber}/settle`, request);
  }

  getClaimStatistics(): Observable<Map<ClaimStatus, number>> {
    return this.http.get<Map<ClaimStatus, number>>(`${this.apiUrl}/admin/claims/statistics`);
  }
}
