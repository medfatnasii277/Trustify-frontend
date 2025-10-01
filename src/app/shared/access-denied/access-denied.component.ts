import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-access-denied',
  templateUrl: './access-denied.component.html',
  styleUrls: ['./access-denied.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class AccessDeniedComponent {
  constructor(private router: Router) {}

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}