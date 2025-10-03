import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface UserProfileRequest {
  firstName: string;
  lastName: string;
  dateOfBirth: string; // ISO date string
  phoneNumber?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  employmentStatus: string;
  occupation?: string;
  company?: string;
  annualIncome?: number;
}

export interface UserProfileResponse {
  id: number;
  keycloakId: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  age: number;
  phoneNumber?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  employmentStatus: string;
  occupation?: string;
  company?: string;
  annualIncome?: number;
  profileCompleted: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private apiUrl = `${environment.apiUrl}/profiles`;

  constructor(private http: HttpClient) {}

  /**
   * Get current user's profile
   */
  getCurrentUserProfile(): Observable<UserProfileResponse> {
    return this.http.get<UserProfileResponse>(`${this.apiUrl}/me`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Create a new user profile
   */
  createUserProfile(profileData: UserProfileRequest): Observable<UserProfileResponse> {
    console.log('UserProfileService: Creating profile with data:', profileData);
    console.log('UserProfileService: API URL:', this.apiUrl);
    
    return this.http.post<UserProfileResponse>(this.apiUrl, profileData)
      .pipe(
        catchError(error => {
          console.error('Error creating profile:', error);
          return this.handleError(error);
        })
      );
  }

  /**
   * Update existing user profile
   */
  updateUserProfile(id: number, profileData: UserProfileRequest): Observable<UserProfileResponse> {
    return this.http.put<UserProfileResponse>(`${this.apiUrl}/${id}`, profileData)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Check if current user has completed profile
   */
  hasCompletedProfile(): Observable<boolean> {
    return new Observable<boolean>(observer => {
      this.getCurrentUserProfile().subscribe({
        next: (profile) => {
          observer.next(profile.profileCompleted);
          observer.complete();
        },
        error: (error) => {
          // If profile doesn't exist, user hasn't completed it
          if (error.status === 404) {
            observer.next(false);
            observer.complete();
          } else {
            observer.error(error);
          }
        }
      });
    });
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';

    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Backend returned an unsuccessful response code
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      
      // Log specific details for API errors
      if (error.status === 400) {
        console.error('Bad Request - Validation errors:', error.error);
      } else if (error.status === 401) {
        console.error('Unauthorized - Authentication required');
      } else if (error.status === 403) {
        console.error('Forbidden - Insufficient permissions');
      } else if (error.status === 404) {
        console.error('Not found - Resource does not exist');
      } else if (error.status >= 500) {
        console.error('Server error:', error.error);
      }
    }

    console.error('UserProfileService Error:', error);
    return throwError(() => error);
  }
}