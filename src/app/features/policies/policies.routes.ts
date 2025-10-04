import { Routes } from '@angular/router';
import { PolicySelectionComponent } from './pages/policy-selection/policy-selection.component';

export const POLICY_ROUTES: Routes = [
  {
    path: '',
    component: PolicySelectionComponent
  },
  {
    path: 'select',
    component: PolicySelectionComponent
  },
  {
    path: 'list',
    loadComponent: () => import('./pages/policy-list/policy-list.component')
      .then(m => m.PolicyListComponent)
  },
  {
    path: 'life/new',
    loadComponent: () => import('./pages/life-insurance-form/life-insurance-form.component')
      .then(m => m.LifeInsuranceFormComponent)
  },
  {
    path: 'car/new',
    loadComponent: () => import('./pages/car-insurance-form/car-insurance-form.component')
      .then(m => m.CarInsuranceFormComponent)
  },
  {
    path: 'house/new',
    loadComponent: () => import('./pages/house-insurance-form/house-insurance-form.component')
      .then(m => m.HouseInsuranceFormComponent)
  }
];