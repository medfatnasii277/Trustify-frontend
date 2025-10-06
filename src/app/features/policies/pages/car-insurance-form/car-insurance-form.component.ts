import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { PolicyService } from '../../services/policy.service';
import { PaymentFrequency } from '../../models';

@Component({
  selector: 'app-car-insurance-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  styleUrls: ['./car-insurance-form.component.css'],
  template: `
    <div class="container">
      <div class="header">
        <button class="back-btn" (click)="navigateToDashboard()">
          ← Back
        </button>
        <h1>Car Insurance Application</h1>
        <p>Get comprehensive coverage for your vehicle</p>
      </div>

      <form [formGroup]="carInsuranceForm" (ngSubmit)="onSubmit()" class="form">
        <!-- Basic Policy Information -->
        <div class="section">
          <h2>Policy Details</h2>
          <div class="form-row">
            <div class="form-group">
              <label>Policy Start Date*</label>
              <input type="date" formControlName="startDate" class="form-control">
              <div *ngIf="carInsuranceForm.get('startDate')?.invalid && carInsuranceForm.get('startDate')?.touched" class="error">
                Start date is required
              </div>
            </div>
            <div class="form-group">
              <label>Policy End Date*</label>
              <input type="date" formControlName="endDate" class="form-control">
              <div *ngIf="carInsuranceForm.get('endDate')?.invalid && carInsuranceForm.get('endDate')?.touched" class="error">
                End date is required
              </div>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Coverage Amount*</label>
              <input type="number" formControlName="coverageAmount" placeholder="50000" class="form-control">
              <div *ngIf="carInsuranceForm.get('coverageAmount')?.invalid && carInsuranceForm.get('coverageAmount')?.touched" class="error">
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
              <div *ngIf="carInsuranceForm.get('paymentFrequency')?.invalid && carInsuranceForm.get('paymentFrequency')?.touched" class="error">
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

        <!-- Vehicle Information -->
        <div class="section">
          <h2>Vehicle Information</h2>
          <div class="form-row">
            <div class="form-group">
              <label>Vehicle Year*</label>
              <input type="number" formControlName="vehicleYear" placeholder="2020" class="form-control">
              <div *ngIf="carInsuranceForm.get('vehicleYear')?.invalid && carInsuranceForm.get('vehicleYear')?.touched" class="error">
                Vehicle year is required
              </div>
            </div>
            <div class="form-group">
              <label>Vehicle Make*</label>
              <input type="text" formControlName="vehicleMake" placeholder="Toyota" class="form-control">
              <div *ngIf="carInsuranceForm.get('vehicleMake')?.invalid && carInsuranceForm.get('vehicleMake')?.touched" class="error">
                Vehicle make is required
              </div>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Vehicle Model*</label>
              <input type="text" formControlName="vehicleModel" placeholder="Corolla" class="form-control">
              <div *ngIf="carInsuranceForm.get('vehicleModel')?.invalid && carInsuranceForm.get('vehicleModel')?.touched" class="error">
                Vehicle model is required
              </div>
            </div>
            <div class="form-group">
              <label>Vehicle VIN*</label>
              <input type="text" formControlName="vehicleVIN" placeholder="17-character VIN" class="form-control">
              <div *ngIf="carInsuranceForm.get('vehicleVIN')?.invalid && carInsuranceForm.get('vehicleVIN')?.touched" class="error">
                Vehicle VIN is required
              </div>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>License Plate*</label>
              <input type="text" formControlName="licensePlate" placeholder="ABC-1234" class="form-control">
              <div *ngIf="carInsuranceForm.get('licensePlate')?.invalid && carInsuranceForm.get('licensePlate')?.touched" class="error">
                License plate is required
              </div>
            </div>
          </div>
        </div>

        <!-- Coverage Details -->
        <div class="section">
          <h2>Coverage Details</h2>
          <div class="form-row">
            <div class="form-group">
              <label>Coverage Type*</label>
              <select formControlName="coverageType" class="form-control">
                <option value="">Select coverage type</option>
                <option value="LIABILITY_ONLY">Liability Only</option>
                <option value="COLLISION">Collision</option>
                <option value="COMPREHENSIVE">Comprehensive</option>
                <option value="FULL_COVERAGE">Full Coverage</option>
              </select>
              <div *ngIf="carInsuranceForm.get('coverageType')?.invalid && carInsuranceForm.get('coverageType')?.touched" class="error">
                Coverage type is required
              </div>
            </div>
          </div>

          <div class="checkbox-section">
            <h3>Optional Coverage</h3>
            <label class="checkbox">
              <input type="checkbox" formControlName="includesRoadSideAssistance">
              Roadside Assistance
            </label>
            <label class="checkbox">
              <input type="checkbox" formControlName="includesRentalCarCoverage">
              Rental Car Coverage
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
          <button type="submit" [disabled]="carInsuranceForm.invalid || isSubmitting" class="btn btn-primary">
            {{ isSubmitting ? 'Submitting...' : 'Submit Application' }}
          </button>
        </div>
      </form>
    </div>
  `
})
export class CarInsuranceFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  public router = inject(Router);
  private policyService = inject(PolicyService);

  carInsuranceForm!: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  ngOnInit() {
    this.initializeForm();
  }

  private initializeForm() {
    this.carInsuranceForm = this.fb.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      coverageAmount: ['', [Validators.required, Validators.min(1)]],
      paymentFrequency: ['', Validators.required],
      description: [''],
      vehicleYear: ['', [Validators.required, Validators.min(1900)]],
      vehicleMake: ['', Validators.required],
      vehicleModel: ['', Validators.required],
      vehicleVIN: ['', [Validators.required, Validators.pattern(/^[A-HJ-NPR-Z0-9]{17}$/)]],
      licensePlate: ['', Validators.required],
      coverageType: ['', Validators.required],
      includesRoadSideAssistance: [false],
      includesRentalCarCoverage: [false]
    });
  }

  navigateToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  onSubmit() {
    if (this.carInsuranceForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const formValue = this.carInsuranceForm.value;

    const policyData = {
      startDate: formValue.startDate,
      endDate: formValue.endDate,
      coverageAmount: formValue.coverageAmount,
      paymentFrequency: formValue.paymentFrequency,
      description: formValue.description || '',
      vehicleMake: formValue.vehicleMake,
      vehicleModel: formValue.vehicleModel,
      vehicleYear: formValue.vehicleYear,
      vehicleVIN: formValue.vehicleVIN,
      licensePlate: formValue.licensePlate,
      coverageType: formValue.coverageType,
      includesRoadSideAssistance: formValue.includesRoadSideAssistance,
      includesRentalCarCoverage: formValue.includesRentalCarCoverage
    };

    this.policyService.createCarPolicy(policyData).subscribe({
      next: (response: any) => {
        this.isSubmitting = false;
        this.router.navigate(['/dashboard'], {
          state: { successMessage: 'Car insurance policy application submitted successfully!' }
        });
      },
      error: (error: any) => {
        this.isSubmitting = false;
        this.errorMessage = error.error?.message || 'Failed to submit car insurance policy application. Please try again.';
        console.error('Error submitting car insurance policy:', error);
      }
    });
  }

  private markFormGroupTouched() {
    Object.keys(this.carInsuranceForm.controls).forEach(key => {
      const control = this.carInsuranceForm.get(key);
      control?.markAsTouched();
    });
  }
}