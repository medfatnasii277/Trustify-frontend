import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { POLICY_ROUTES } from './features/policies/policies.routes';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth/login',
    loadComponent: () => 
      import('./features/auth/pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'auth/signup',
    loadComponent: () => 
      import('./features/auth/pages/signup/signup.component').then(m => m.SignupComponent)
  },
  {
    path: 'access-denied',
    loadComponent: () => 
      import('./shared/access-denied/access-denied.component').then(m => m.AccessDeniedComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => 
      import('./features/dashboard/pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'policies',
    children: POLICY_ROUTES,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'user' }
  },
  {
    path: 'hello-user',
    loadComponent: () => 
      import('./features/user/pages/hello-user/hello-user.component').then(m => m.HelloUserComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'user' }
  },
  {
    path: 'hello-admin',
    loadComponent: () => 
      import('./features/admin/pages/hello-admin/hello-admin.component').then(m => m.HelloAdminComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'admin' }
  },
  {
    path: '**',
    redirectTo: '/auth/login'
  }
];
