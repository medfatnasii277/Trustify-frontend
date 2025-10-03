import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { PolicyService } from '../../services/policy.service';
import { PaymentFrequency } from '../../models';

@Component({
  selector: 'app-life-insurance-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  styleUrls: ['./life-insurance-form.component.css'],
  template: `
    <div class="container">
      <div class="header">
        <button class="back-btn" (click)="navigateToDashboard()">
          ← Back
        </button>
        <h1>Life Insurance Application</h1>
        <p>Secure your family's future</p>
      </div>

      <form [formGroup]="lifeInsuranceForm" (ngSubmit)="onSubmit()" class="form">
        <!-- Basic Policy Information -->
        <div class="section">
          <h2>Policy Details</h2>
          <div class="form-row">
            <div class="form-group">
              <label>Policy Start Date*</label>
              <input type="date" formControlName="startDate" class="form-control">
              <div *ngIf="lifeInsuranceForm.get('startDate')?.invalid && lifeInsuranceForm.get('startDate')?.touched" class="error">
                Start date is required
              </div>
            </div>
            <div class="form-group">
              <label>Policy End Date*</label>
              <input type="date" formControlName="endDate" class="form-control">
              <div *ngIf="lifeInsuranceForm.get('endDate')?.invalid && lifeInsuranceForm.get('endDate')?.touched" class="error">
                End date is required
              </div>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Coverage Amount*</label>
              <input type="number" formControlName="coverageAmount" placeholder="500000" class="form-control">
              <div *ngIf="lifeInsuranceForm.get('coverageAmount')?.invalid && lifeInsuranceForm.get('coverageAmount')?.touched" class="error">
                Coverage amount is required
              </div>
            </div>
            <div class="form-group">
              <label>Payment Frequency*</label>
              <select formControlName="paymentFrequency" class="form-control">
                <option value="">Select frequency</option>
                <option value="MONTHLY">Monthly</option>
                <option value="QUARTERLY">Quarterly</option>
                <option value="ANNUALLY">Annually</option>
              </select>
              <div *ngIf="lifeInsuranceForm.get('paymentFrequency')?.invalid && lifeInsuranceForm.get('paymentFrequency')?.touched" class="error">
                Payment frequency is required
              </div>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Policy Type*</label>
              <select formControlName="policyType" class="form-control">
                <option value="">Select policy type</option>
                <option value="TERM">Term Life</option>
                <option value="WHOLE">Whole Life</option>
                <option value="UNIVERSAL">Universal Life</option>
              </select>
              <div *ngIf="lifeInsuranceForm.get('policyType')?.invalid && lifeInsuranceForm.get('policyType')?.touched" class="error">
                Policy type is required
              </div>
            </div>
            <div class="form-group">
              <label>Description</label>
              <input type="text" formControlName="description" placeholder="Optional policy description" class="form-control">
            </div>
          </div>
        </div>

        <!-- Additional Coverage Options -->
        <div class="section">
          <h2>Additional Coverage Options</h2>
          <div class="checkbox-section">
            <label class="checkbox">
              <input type="checkbox" formControlName="includesCriticalIllness">
              Include Critical Illness Coverage
            </label>
            <label class="checkbox">
              <input type="checkbox" formControlName="includesDisabilityBenefit">
              Include Disability Benefit
            </label>
          </div>
        </div>

        <!-- Beneficiary Information -->
        <div class="section">
          <h2>Beneficiary Information</h2>
          <div class="form-row">
            <div class="form-group">
              <label>Beneficiary Name*</label>
              <input type="text" formControlName="beneficiaryName" placeholder="Jane Doe" class="form-control">
              <div *ngIf="lifeInsuranceForm.get('beneficiaryName')?.invalid && lifeInsuranceForm.get('beneficiaryName')?.touched" class="error">
                Beneficiary name is required
              </div>
            </div>
            <div class="form-group">
              <label>Relationship*</label>
              <select formControlName="beneficiaryRelationship" class="form-control">
                <option value="">Select relationship</option>
                <option value="SPOUSE">Spouse</option>
                <option value="CHILD">Child</option>
                <option value="PARENT">Parent</option>
                <option value="SIBLING">Sibling</option>
                <option value="OTHER">Other</option>
              </select>
              <div *ngIf="lifeInsuranceForm.get('beneficiaryRelationship')?.invalid && lifeInsuranceForm.get('beneficiaryRelationship')?.touched" class="error">
                Relationship is required
              </div>
            </div>
          </div>
        </div>



        <!-- Error Message -->
        <div *ngIf="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <!-- Success Message -->
        <div *ngIf="successMessage" class="success-message">
          {{ successMessage }}
        </div>

        <!-- Submit Button -->
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" (click)="navigateToDashboard()">
            Cancel
          </button>
          <button type="submit" [disabled]="lifeInsuranceForm.invalid || isSubmitting" class="btn btn-primary">
            {{ isSubmitting ? 'Submitting...' : 'Submit Application' }}
          </button>
        </div>
      </form>
    </div>
  `
})
export class LifeInsuranceFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  public router = inject(Router);
  private policyService = inject(PolicyService);

  lifeInsuranceForm!: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  ngOnInit() {
    this.initializeForm();
  }

  navigateToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  private initializeForm() {
    this.lifeInsuranceForm = this.fb.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      coverageAmount: ['', [Validators.required, Validators.min(1)]],
      paymentFrequency: ['', Validators.required],
      policyType: ['', Validators.required],
      description: [''],
      includesCriticalIllness: [false],
      includesDisabilityBenefit: [false],
      beneficiaryName: ['', Validators.required],
      beneficiaryRelationship: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.lifeInsuranceForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const formValue = this.lifeInsuranceForm.value;

    const policyData = {
      startDate: formValue.startDate,
      endDate: formValue.endDate,
      coverageAmount: formValue.coverageAmount,
      paymentFrequency: formValue.paymentFrequency,
      description: formValue.description || '',
      policyType: formValue.policyType,
      includesCriticalIllness: formValue.includesCriticalIllness,
      includesDisabilityBenefit: formValue.includesDisabilityBenefit,
      beneficiaryName: formValue.beneficiaryName,
      beneficiaryRelationship: formValue.beneficiaryRelationship
    };    this.policyService.createLifePolicy(policyData).subscribe({
      next: (response: any) => {
        this.isSubmitting = false;
        this.router.navigate(['/dashboard'], {
          state: { successMessage: 'Life insurance policy application submitted successfully!' }
        });
      },
      error: (error: any) => {
        this.isSubmitting = false;
        this.errorMessage = error.error?.message || 'Failed to submit life insurance policy application. Please try again.';
        console.error('Error submitting life insurance policy:', error);
      }
    });
  }

  private markFormGroupTouched() {
    Object.keys(this.lifeInsuranceForm.controls).forEach(key => {
      const control = this.lifeInsuranceForm.get(key);
      control?.markAsTouched();
    });
  }
}