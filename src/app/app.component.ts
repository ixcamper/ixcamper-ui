import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastService } from './core/services/toast.service';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'app-root',
	standalone: true,
	imports: [RouterOutlet, CommonModule],
	template: `
    <router-outlet></router-outlet>

    <div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 1100">
		@if (toast.message()) {
			<div
				class="toast show align-items-center text-white border-0 shadow" 
				[ngClass]="toast.type() === 'success' ? 'bg-success' : 'bg-danger'"
				role="alert">
				<div class="d-flex">
				<div class="toast-body">
					<i class="bi bi-check-circle-fill me-2"></i> {{ toast.message() }}
				</div>
				<button type="button" class="btn-close btn-close-white me-2 m-auto" (click)="toast.message.set(null)"></button>
				</div>
			</div>
		}
      
    </div>
  `
})
export class AppComponent {
	toast = inject(ToastService);
}