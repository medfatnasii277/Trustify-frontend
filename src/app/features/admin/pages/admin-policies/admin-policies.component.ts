import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminPolicyService, AnyInsurancePolicy } from '../../../../core/services/admin-policy.service';
import { PolicyStatus } from '../../../policies/models';

@Component({
  selector: 'app-admin-policies',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-policies.component.html',
  styleUrls: ['./admin-policies.component.css']
})
export class AdminPoliciesComponent implements OnInit {
  private adminPolicyService = inject(AdminPolicyService);
  private router = inject(Router);

  policies: AnyInsurancePolicy[] = [];
  filteredPolicies: AnyInsurancePolicy[] = [];
  isLoading = true;
  errorMessage = '';
  successMessage = '';

  // Filter options
  statusFilter: string = 'ALL';
  typeFilter: string = 'ALL';
  searchTerm: string = '';

  // Policy statuses
  PolicyStatus = PolicyStatus;
  statuses = Object.values(PolicyStatus);
  policyTypes = ['CAR', 'LIFE', 'HOUSE'];

  ngOnInit(): void {
    this.loadPolicies();
  }

  loadPolicies(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.adminPolicyService.getAllPolicies().subscribe({
      next: (policies) => {
        this.policies = policies;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading policies:', error);
        this.errorMessage = 'Failed to load policies. Please try again.';
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.policies];

    // Apply status filter
    if (this.statusFilter !== 'ALL') {
      filtered = filtered.filter(policy => policy.status === this.statusFilter);
    }

    // Apply type filter
    if (this.typeFilter !== 'ALL') {
      filtered = filtered.filter(policy => this.getPolicyType(policy) === this.typeFilter);
    }

    // Apply search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(policy =>
        policy.policyNumber?.toLowerCase().includes(term) ||
        policy.description?.toLowerCase().includes(term)
      );
    }

    this.filteredPolicies = filtered;
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  getPolicyType(policy: AnyInsurancePolicy): string {
    if ('vehicleMake' in policy) return 'CAR';
    if ('policyType' in policy) return 'LIFE';
    if ('propertyAddress' in policy) return 'HOUSE';
    return 'UNKNOWN';
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'ACTIVE': 'status-active',
      'PENDING': 'status-pending',
      'CANCELLED': 'status-cancelled',
      'EXPIRED': 'status-expired'
    };
    return statusMap[status] || 'status-default';
  }

  viewDetails(policy: AnyInsurancePolicy): void {
    const type = this.getPolicyType(policy).toLowerCase();
    this.router.navigate([`/policies/${type}`, policy.id]);
  }

  back(): void {
    this.router.navigate(['/hello-admin']);
  }
}
