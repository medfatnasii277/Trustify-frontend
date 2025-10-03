import { Component, OnInit, ChangeDetectorRef, NgZone, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserProfileService, UserProfileRequest } from '../../../../core/services/user-profile.service';
import { KeycloakService } from '../../../../core/services/keycloak.service';

@Component({
  selector: 'app-profile-completion',
  templateUrl: './profile-completion.component.html',
  styleUrls: ['./profile-completion.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class ProfileCompletionComponent implements OnInit {
  // Force a static compile-time reference to ensure component is included in bundle
  static componentName = 'ProfileCompletionComponent';
  @ViewChild('profileFormElement') profileFormElement?: ElementRef;
  profileForm: FormGroup;
  isLoading = false;
  isSubmitting = false;
  errorMessage = '';
  console = console; // Make console available in the template
  employmentStatuses = [
    { value: 'EMPLOYED', label: 'Employed' },
    { value: 'SELF_EMPLOYED', label: 'Self Employed' },
    { value: 'UNEMPLOYED', label: 'Unemployed' },
    { value: 'STUDENT', label: 'Student' },
    { value: 'RETIRED', label: 'Retired' }
  ];

  constructor(
    private fb: FormBuilder,
    private userProfileService: UserProfileService,
    private keycloakService: KeycloakService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {
    this.profileForm = this.createForm();
  }

  ngOnInit(): void {
    console.log('ProfileCompletionComponent initialized');
    this.loadExistingProfile();
    
    // Safety timeout to ensure form is shown even if loading gets stuck
    setTimeout(() => {
      this.ngZone.run(() => {
        if (this.isLoading) {
          console.warn('Profile loading timed out, forcing display of form');
          this.isLoading = false;
          this.cdr.detectChanges(); // Force change detection
        }
      });
    }, 3000);
  }

  private createForm(): FormGroup {
    return this.fb.group({
      firstName: ['John', [Validators.required, Validators.minLength(2)]],
      lastName: ['Doe', [Validators.required, Validators.minLength(2)]],
      dateOfBirth: ['1990-01-01', [Validators.required]],
      phoneNumber: ['5551234567', [Validators.pattern(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/)]],
      address: ['123 Main St', [Validators.required]],
      city: ['Anytown', [Validators.required]],
      state: ['NY', [Validators.required]],
      zipCode: ['12345', [Validators.required, Validators.pattern(/^[0-9]{5}(?:-[0-9]{4})?$/)]],
      country: ['USA', [Validators.required]],
      employmentStatus: ['EMPLOYED', [Validators.required]],
      occupation: ['Developer'],
      company: ['Tech Inc'],
      annualIncome: [75000, [Validators.min(0)]]
    });
  }

  private loadExistingProfile(): void {
    console.log('Loading profile, setting isLoading to true');
    this.isLoading = true;
    this.cdr.detectChanges(); // Force change detection before API call
    
    this.userProfileService.getCurrentUserProfile().subscribe({
      next: (profile) => {
        // Use ngZone to ensure Angular detects changes
        this.ngZone.run(() => {
          console.log('Profile loaded successfully:', profile);
          if (profile) {
            this.profileForm.patchValue({
              firstName: profile.firstName,
              lastName: profile.lastName,
              dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : '',
              phoneNumber: profile.phoneNumber,
              address: profile.address,
              city: profile.city,
              state: profile.state,
              zipCode: profile.zipCode,
              country: profile.country,
              employmentStatus: profile.employmentStatus,
              occupation: profile.occupation,
              company: profile.company,
              annualIncome: profile.annualIncome
            });
          }
          console.log('Setting isLoading to false after successful profile load');
          this.isLoading = false;
          this.cdr.detectChanges(); // Force change detection after state change
        });
      },
      error: (error) => {
        // Use ngZone to ensure Angular detects changes
        this.ngZone.run(() => {
          // 404 is expected when profile doesn't exist yet
          if (error.status === 404) {
            console.log('No existing profile found (404), user needs to complete it');
          } else {
            console.error('Error loading profile:', error);
          }
          console.log('Setting isLoading to false after error');
          this.isLoading = false;
          this.cdr.detectChanges(); // Force change detection after state change
        });
      }
    });
  }

  onSubmit(): void {
    console.log('onSubmit called, form valid:', this.profileForm.valid);
    console.log('Form values:', this.profileForm.value);
    console.log('Form errors:', this.getFormValidationErrors());
    
    if (this.profileForm.valid) {
      this.ngZone.run(() => {
        console.log('Form is valid, submitting...');
        this.isSubmitting = true;
        this.cdr.detectChanges();
        const formData = this.profileForm.value;

        // Convert date to ISO string
        const profileData: UserProfileRequest = {
          ...formData,
          dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString().split('T')[0] : ''
        };

        console.log('Sending profile data to backend:', profileData);
        
        this.userProfileService.createUserProfile(profileData).subscribe({
          next: (response) => {
            this.ngZone.run(() => {
              console.log('Profile created successfully', response);
              this.isSubmitting = false;
              alert('Profile created successfully! Redirecting to dashboard...');
              // Redirect to dashboard after successful profile completion
              this.router.navigate(['/user/dashboard']);
            });
          },
          error: (error) => {
            this.ngZone.run(() => {
              console.error('Failed to create profile', error);
              this.isSubmitting = false;
              this.errorMessage = `Failed to save profile: ${error.status} ${error.statusText}. ${error.message || ''}`;
              alert(`Error: ${this.errorMessage}`);
              this.cdr.detectChanges();
            });
          }
        });
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.profileForm.controls).forEach(key => {
        this.profileForm.get(key)?.markAsTouched();
      });
    }
  }

  getFieldError(fieldName: string): string {
    const field = this.profileForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      }
      if (field.errors['minlength']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
      if (field.errors['pattern']) {
        if (fieldName === 'phoneNumber') {
          return 'Please enter a valid phone number';
        }
        if (fieldName === 'zipCode') {
          return 'Please enter a valid zip code';
        }
      }
      if (field.errors['min']) {
        return 'Annual income cannot be negative';
      }
    }
    return '';
  }

  logout(): void {
    this.keycloakService.logout()
      .catch(error => console.error('Logout failed', error));
  }

  getMaxDate(): string {
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    return maxDate.toISOString().split('T')[0];
  }
  
  /**
   * Helper method to get all validation errors from the form
   */
  getFormValidationErrors() {
    const errors: any = {};
    
    Object.keys(this.profileForm.controls).forEach(key => {
      const control = this.profileForm.get(key);
      if (control?.errors) {
        errors[key] = control.errors;
      }
    });
    
    return errors;
  }
}