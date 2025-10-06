import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ClaimResponse, ClaimStatus } from '../../features/claims/models/claim.model';
import { ClaimApprovalRequest, ClaimRejectionRequest, ClaimStatistics } from '../models/admin.model';

@Injectable({
  providedIn: 'root'
})
export class AdminClaimService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/admin/claims`;

  /**
   * Get all claims in the system
   */
  getAllClaims(): Observable<ClaimResponse[]> {
    console.log('AdminClaimService: Getting all claims');
    return this.http.get<ClaimResponse[]>(this.apiUrl);
  }

  /**
   * Get claims filtered by status
   */
  getClaimsByStatus(status: ClaimStatus): Observable<ClaimResponse[]> {
    console.log('AdminClaimService: Getting claims by status:', status);
    return this.http.get<ClaimResponse[]>(`${this.apiUrl}/by-status/${status}`);
  }

  /**
   * Move claim to under review status
   */
  moveToUnderReview(claimNumber: string): Observable<ClaimResponse> {
    console.log('AdminClaimService: Moving claim to under review:', claimNumber);
    return this.http.patch<ClaimResponse>(`${this.apiUrl}/${claimNumber}/under-review`, {});
  }

  /**
   * Approve a claim
   */
  approveClaim(request: ClaimApprovalRequest): Observable<ClaimResponse> {
    console.log('AdminClaimService: Approving claim:', request.claimNumber);
    return this.http.patch<ClaimResponse>(
      `${this.apiUrl}/${request.claimNumber}/approve`,
      request
    );
  }

  /**
   * Reject a claim
   */
  rejectClaim(request: ClaimRejectionRequest): Observable<ClaimResponse> {
    console.log('AdminClaimService: Rejecting claim:', request.claimNumber);
    return this.http.patch<ClaimResponse>(
      `${this.apiUrl}/${request.claimNumber}/reject`,
      request
    );
  }

  /**
   * Settle a claim (mark as paid)
   */
  settleClaim(claimNumber: string): Observable<ClaimResponse> {
    console.log('AdminClaimService: Settling claim:', claimNumber);
    return this.http.patch<ClaimResponse>(`${this.apiUrl}/${claimNumber}/settle`, {});
  }

  /**
   * Get claim statistics for dashboard
   */
  getClaimStatistics(): Observable<ClaimStatistics> {
    console.log('AdminClaimService: Getting claim statistics');
    return this.http.get<ClaimStatistics>(`${this.apiUrl}/statistics`);
  }
}
