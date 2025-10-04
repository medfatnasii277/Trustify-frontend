import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { PolicyService } from '../../services/policy.service';
import { PaymentFrequency } from '../../models';

@Component({
  selector: 'app-house-insurance-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  styleUrls: ['./house-insurance-form.component.css'],
  template: `
    <div class="container">
      <div class="header">
        <button class="back-btn" (click)="navigateToDashboard()">
          ← Back
        </button>
        <h1>House Insurance Application</h1>
        <p>Protect your home and belongings</p>
      </div>

      <form [formGroup]="houseInsuranceForm" (ngSubmit)="onSubmit()" class="form">
        <!-- Basic Policy Information -->
        <div class="section">
          <h2>Policy Details</h2>
          <div class="form-row">
            <div class="form-group">
              <label>Policy Start Date*</label>
              <input type="date" formControlName="startDate" class="form-control">
              <div *ngIf="houseInsuranceForm.get('startDate')?.invalid && houseInsuranceForm.get('startDate')?.touched" class="error">
                Start date is required
              </div>
            </div>
            <div class="form-group">
              <label>Policy End Date*</label>
              <input type="date" formControlName="endDate" class="form-control">
              <div *ngIf="houseInsuranceForm.get('endDate')?.invalid && houseInsuranceForm.get('endDate')?.touched" class="error">
                End date is required
              </div>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Coverage Amount*</label>
              <input type="number" formControlName="coverageAmount" placeholder="300000" class="form-control">
              <div *ngIf="houseInsuranceForm.get('coverageAmount')?.invalid && houseInsuranceForm.get('coverageAmount')?.touched" class="error">
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
              <div *ngIf="houseInsuranceForm.get('paymentFrequency')?.invalid && houseInsuranceForm.get('paymentFrequency')?.touched" class="error">
                Payment frequency is required
              </div>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Description</label>
              <input type="text" formControlName="description" placeholder="Optional policy description" class="form-control">
            </div>
          </div>
        </div>

        <!-- Property Information -->
        <div class="section">
          <h2>Property Information</h2>
          <div class="form-row">
            <div class="form-group">
              <label>Property Address*</label>
              <input type="text" formControlName="propertyAddress" placeholder="123 Main St, City, State" class="form-control">
              <div *ngIf="houseInsuranceForm.get('propertyAddress')?.invalid && houseInsuranceForm.get('propertyAddress')?.touched" class="error">
                Property address is required
              </div>
            </div>
            <div class="form-group">
              <label>Property Type*</label>
              <select formControlName="propertyType" class="form-control">
                <option value="">Select property type</option>
                <option value="SINGLE_FAMILY">Single Family Home</option>
                <option value="CONDO">Condominium</option>
                <option value="TOWNHOUSE">Townhouse</option>
                <option value="APARTMENT">Apartment</option>
              </select>
              <div *ngIf="houseInsuranceForm.get('propertyType')?.invalid && houseInsuranceForm.get('propertyType')?.touched" class="error">
                Property type is required
              </div>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Year Built*</label>
              <input type="number" formControlName="yearBuilt" placeholder="2000" class="form-control">
              <div *ngIf="houseInsuranceForm.get('yearBuilt')?.invalid && houseInsuranceForm.get('yearBuilt')?.touched" class="error">
                Year built is required
              </div>
            </div>
            <div class="form-group">
              <label>Property Value*</label>
              <input type="number" formControlName="propertyValue" placeholder="400000" class="form-control">
              <div *ngIf="houseInsuranceForm.get('propertyValue')?.invalid && houseInsuranceForm.get('propertyValue')?.touched" class="error">
                Property value is required
              </div>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Contents Value*</label>
              <input type="number" formControlName="contentsValue" placeholder="50000" class="form-control">
              <div *ngIf="houseInsuranceForm.get('contentsValue')?.invalid && houseInsuranceForm.get('contentsValue')?.touched" class="error">
                Contents value is required
              </div>
            </div>
            <div class="form-group">
              <label>Coverage Type*</label>
              <select formControlName="coverageType" class="form-control">
                <option value="">Select coverage type</option>
                <option value="BASIC">Basic</option>
                <option value="STANDARD">Standard</option>
                <option value="PREMIUM">Premium</option>
                <option value="CUSTOM">Custom</option>
              </select>
              <div *ngIf="houseInsuranceForm.get('coverageType')?.invalid && houseInsuranceForm.get('coverageType')?.touched" class="error">
                Coverage type is required
              </div>
            </div>
          </div>
        </div>

        <!-- Coverage Details -->
        <div class="section">
          <h2>Coverage Details</h2>
          <div class="checkbox-section">
            <h3>Coverage Options</h3>
            <label class="checkbox">
              <input type="checkbox" formControlName="includesFloodCoverage">
              Flood Coverage
            </label>
            <label class="checkbox">
              <input type="checkbox" formControlName="includesEarthquakeCoverage">
              Earthquake Coverage
            </label>
            <label class="checkbox">
              <input type="checkbox" formControlName="includesLiabilityCoverage">
              Liability Coverage
            </label>
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
          <button type="submit" [disabled]="houseInsuranceForm.invalid || isSubmitting" class="btn btn-primary">
            {{ isSubmitting ? 'Submitting...' : 'Submit Application' }}
          </button>
        </div>
      </form>
    </div>
  `
})
export class HouseInsuranceFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  public router = inject(Router);
  private policyService = inject(PolicyService);

  houseInsuranceForm!: FormGroup;
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
    this.houseInsuranceForm = this.fb.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      coverageAmount: ['', [Validators.required, Validators.min(1)]],
      paymentFrequency: ['', Validators.required],
      description: [''],
      propertyAddress: ['', Validators.required],
      propertyType: ['', Validators.required],
      yearBuilt: ['', [Validators.required, Validators.min(1800)]],
      propertyValue: ['', [Validators.required, Validators.min(1)]],
      contentsValue: ['', [Validators.required, Validators.min(1)]],
      coverageType: ['', Validators.required],
      includesFloodCoverage: [false],
      includesEarthquakeCoverage: [false],
      includesLiabilityCoverage: [true]
    });
  }

  onSubmit() {
    if (this.houseInsuranceForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const formValue = this.houseInsuranceForm.value;

    const policyData = {
      startDate: formValue.startDate,
      endDate: formValue.endDate,
      coverageAmount: formValue.coverageAmount,
      paymentFrequency: formValue.paymentFrequency,
      description: formValue.description || '',
      propertyAddress: formValue.propertyAddress,
      propertyType: formValue.propertyType,
      yearBuilt: formValue.yearBuilt,
      propertyValue: formValue.propertyValue,
      contentsValue: formValue.contentsValue,
      coverageType: formValue.coverageType,
      includesFloodCoverage: formValue.includesFloodCoverage,
      includesEarthquakeCoverage: formValue.includesEarthquakeCoverage,
      includesLiabilityCoverage: formValue.includesLiabilityCoverage
    };

    this.policyService.createHousePolicy(policyData).subscribe({
      next: (response: any) => {
        this.isSubmitting = false;
        this.router.navigate(['/dashboard'], {
          state: { successMessage: 'House insurance policy application submitted successfully!' }
        });
      },
      error: (error: any) => {
        this.isSubmitting = false;
        this.errorMessage = error.error?.message || 'Failed to submit house insurance policy application. Please try again.';
        console.error('Error submitting house insurance policy:', error);
      }
    });
  }

  private markFormGroupTouched() {
    Object.keys(this.houseInsuranceForm.controls).forEach(key => {
      const control = this.houseInsuranceForm.get(key);
      control?.markAsTouched();
    });
  }
}