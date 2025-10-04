import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ClaimService } from '../../services/claim.service';
import { PolicyService } from '../../../policies/services/policy.service';
import { ClaimType, PolicyType, Severity, getClaimTypesByPolicy } from '../../models/claim.model';
import { forkJoin } from 'rxjs';

interface PolicyOption {
  policyNumber: string;
  policyType: PolicyType;
  label: string;
}

@Component({
  selector: 'app-claim-submission-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  styleUrls: ['./claim-submission-form.component.css'],
  template: `
    <div class="container">
      <div class="header">
        <h1>Submit Insurance Claim</h1>
        <p>Fill out the form below to submit a new insurance claim</p>
      </div>

      <form [formGroup]="claimForm" (ngSubmit)="onSubmit()" class="form">
        <!-- Error Message -->
        <div *ngIf="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <!-- Success Message -->
        <div *ngIf="successMessage" class="success-message">
          {{ successMessage }}
        </div>

        <!-- Policy Selection -->
        <div class="form-section">
          <h2>Policy Information</h2>
          
          <div class="form-group">
            <label for="policyNumber">Select Policy <span class="required">*</span></label>
            <select 
              id="policyNumber" 
              formControlName="policyNumber" 
              class="form-control"
              (change)="onPolicyChange()">
              <option value="">-- Select a policy --</option>
              <option *ngFor="let policy of availablePolicies" [value]="policy.policyNumber">
                {{ policy.label }}
              </option>
            </select>
            <div *ngIf="claimForm.get('policyNumber')?.invalid && claimForm.get('policyNumber')?.touched" class="error-text">
              Please select a policy
            </div>
          </div>

          <div class="form-group" *ngIf="selectedPolicyType">
            <label>Policy Type</label>
            <input type="text" [value]="selectedPolicyType" class="form-control" readonly>
          </div>
        </div>

        <!-- Claim Details -->
        <div class="form-section" *ngIf="selectedPolicyType">
          <h2>Claim Details</h2>

          <div class="form-group">
            <label for="claimType">Type of Claim <span class="required">*</span></label>
            <select id="claimType" formControlName="claimType" class="form-control">
              <option value="">-- Select claim type --</option>
              <option *ngFor="let type of availableClaimTypes" [value]="type">
                {{ formatClaimType(type) }}
              </option>
            </select>
            <div *ngIf="claimForm.get('claimType')?.invalid && claimForm.get('claimType')?.touched" class="error-text">
              Please select a claim type
            </div>
          </div>

          <div class="form-group">
            <label for="incidentDate">Incident Date <span class="required">*</span></label>
            <input 
              type="date" 
              id="incidentDate" 
              formControlName="incidentDate" 
              class="form-control"
              [max]="today">
            <div *ngIf="claimForm.get('incidentDate')?.invalid && claimForm.get('incidentDate')?.touched" class="error-text">
              Please enter a valid incident date
            </div>
          </div>

          <div class="form-group">
            <label for="claimedAmount">Claimed Amount ($) <span class="required">*</span></label>
            <input 
              type="number" 
              id="claimedAmount" 
              formControlName="claimedAmount" 
              placeholder="10000"
              class="form-control"
              min="0"
              step="0.01">
            <div *ngIf="claimForm.get('claimedAmount')?.invalid && claimForm.get('claimedAmount')?.touched" class="error-text">
              Please enter a valid amount (minimum $1)
            </div>
          </div>

          <div class="form-group">
            <label for="severity">Severity (Optional)</label>
            <select id="severity" formControlName="severity" class="form-control">
              <option value="">-- Auto-calculate --</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
            <small class="form-help">Leave empty for automatic severity assessment</small>
          </div>
        </div>

        <!-- Incident Information -->
        <div class="form-section" *ngIf="selectedPolicyType">
          <h2>Incident Information</h2>

          <div class="form-group">
            <label for="incidentLocation">Incident Location (Optional)</label>
            <input 
              type="text" 
              id="incidentLocation" 
              formControlName="incidentLocation" 
              placeholder="123 Main St, City, State"
              class="form-control">
          </div>

          <div class="form-group">
            <label for="description">Incident Description <span class="required">*</span></label>
            <textarea 
              id="description" 
              formControlName="description" 
              placeholder="Provide detailed description of the incident..."
              class="form-control textarea"
              rows="5"></textarea>
            <div *ngIf="claimForm.get('description')?.invalid && claimForm.get('description')?.touched" class="error-text">
              Please provide a description (minimum 20 characters)
            </div>
          </div>

          <div class="form-group">
            <label for="documentsPath">Supporting Documents Path (Optional)</label>
            <input 
              type="text" 
              id="documentsPath" 
              formControlName="documentsPath" 
              placeholder="/documents/claims/..."
              class="form-control">
            <small class="form-help">Path to uploaded supporting documents</small>
          </div>
        </div>

        <!-- Actions -->
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" (click)="navigateBack()" [disabled]="isSubmitting">
            Cancel
          </button>
          <button type="submit" class="btn btn-primary" [disabled]="isSubmitting || claimForm.invalid">
            <span *ngIf="!isSubmitting">Submit Claim</span>
            <span *ngIf="isSubmitting">Submitting...</span>
          </button>
        </div>
      </form>
    </div>
  `
})
export class ClaimSubmissionFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private claimService = inject(ClaimService);
  private policyService = inject(PolicyService);

  claimForm!: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  availablePolicies: PolicyOption[] = [];
  availableClaimTypes: ClaimType[] = [];
  selectedPolicyType: PolicyType | null = null;
  today = new Date().toISOString().split('T')[0];

  ngOnInit(): void {
    this.initializeForm();
    this.loadUserPolicies();
  }

  private initializeForm(): void {
    this.claimForm = this.fb.group({
      policyNumber: ['', Validators.required],
      policyType: ['', Validators.required],
      claimType: ['', Validators.required],
      incidentDate: ['', Validators.required],
      claimedAmount: ['', [Validators.required, Validators.min(1)]],
      description: ['', [Validators.required, Validators.minLength(20)]],
      incidentLocation: [''],
      documentsPath: [''],
      severity: ['']
    });
  }

  private loadUserPolicies(): void {
    forkJoin({
      life: this.policyService.getMyLifePolicies(),
      car: this.policyService.getMyCarPolicies(),
      house: this.policyService.getMyHousePolicies()
    }).subscribe({
      next: (policies) => {
        console.log('Loaded policies:', policies);
        
        // Filter for policies that are not CANCELLED or EXPIRED
        const validStatuses = ['ACTIVE', 'PENDING'];
        
        this.availablePolicies = [
          ...policies.life.filter(p => p.status && validStatuses.includes(p.status) && p.policyNumber).map(p => ({
            policyNumber: p.policyNumber!,
            policyType: PolicyType.LIFE,
            label: `${p.policyNumber} - Life Insurance`
          })),
          ...policies.car.filter(p => p.status && validStatuses.includes(p.status) && p.policyNumber).map(p => ({
            policyNumber: p.policyNumber!,
            policyType: PolicyType.CAR,
            label: `${p.policyNumber} - Car Insurance (${p.vehicleMake} ${p.vehicleModel})`
          })),
          ...policies.house.filter(p => p.status && validStatuses.includes(p.status) && p.policyNumber).map(p => ({
            policyNumber: p.policyNumber!,
            policyType: PolicyType.HOUSE,
            label: `${p.policyNumber} - House Insurance (${p.propertyType})`
          }))
        ];

        console.log('Available policies for claims:', this.availablePolicies);

        if (this.availablePolicies.length === 0) {
          this.errorMessage = 'You have no active policies. Please create a policy first before submitting a claim.';
        }
      },
      error: (error) => {
        this.errorMessage = 'Failed to load your policies. Please try again.';
        console.error('Error loading policies:', error);
      }
    });
  }

  onPolicyChange(): void {
    const policyNumber = this.claimForm.get('policyNumber')?.value;
    const selectedPolicy = this.availablePolicies.find(p => p.policyNumber === policyNumber);
    
    if (selectedPolicy) {
      this.selectedPolicyType = selectedPolicy.policyType;
      this.claimForm.patchValue({ policyType: selectedPolicy.policyType });
      this.availableClaimTypes = getClaimTypesByPolicy(selectedPolicy.policyType);
      // Reset claim type when policy changes
      this.claimForm.patchValue({ claimType: '' });
    } else {
      this.selectedPolicyType = null;
      this.availableClaimTypes = [];
    }
  }

  formatClaimType(claimType: ClaimType): string {
    return claimType.replace(/_/g, ' ').replace(/CLAIM/g, '').trim();
  }

  onSubmit(): void {
    if (this.claimForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formValue = this.claimForm.value;

    const claimRequest = {
      policyNumber: formValue.policyNumber,
      policyType: formValue.policyType,
      claimType: formValue.claimType,
      incidentDate: formValue.incidentDate,
      claimedAmount: formValue.claimedAmount,
      description: formValue.description,
      incidentLocation: formValue.incidentLocation || undefined,
      documentsPath: formValue.documentsPath || undefined,
      severity: formValue.severity || undefined
    };

    this.claimService.submitClaim(claimRequest).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.successMessage = `Claim ${response.claimNumber} submitted successfully!`;
        setTimeout(() => {
          this.router.navigate(['/claims/list']);
        }, 2000);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = error.error?.message || 'Failed to submit claim. Please try again.';
        console.error('Error submitting claim:', error);
      }
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.claimForm.controls).forEach(key => {
      const control = this.claimForm.get(key);
      control?.markAsTouched();
    });
  }

  navigateBack(): void {
    this.router.navigate(['/claims/list']);
  }
}
