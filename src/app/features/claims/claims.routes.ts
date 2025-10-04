import { Routes } from '@angular/router';

export const CLAIM_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  },
  {
    path: 'list',
    loadComponent: () => import('./pages/claim-list/claim-list.component')
      .then(m => m.ClaimListComponent)
  },
  {
    path: 'submit',
    loadComponent: () => import('./pages/claim-submission-form/claim-submission-form.component')
      .then(m => m.ClaimSubmissionFormComponent)
  }
];
