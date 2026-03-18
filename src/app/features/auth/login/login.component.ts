import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs'; // Import finalize to stop spinner

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container d-flex align-items-center justify-content-center vh-100">
      <div class="card shadow-sm border-0" style="width: 100%; max-width: 400px;">
        <div class="card-body p-4 text-center">
          <h3 class="fw-bold text-primary mb-1">ixcamper</h3>
          <p class="text-muted mb-4">Sign in to your account</p>

          <form (ngSubmit)="onLogin()" #loginForm="ngForm">
            <div class="mb-3 text-start">
              <label class="form-label small fw-bold">Username</label>
              <input
                type="text"
                class="form-control"
                [(ngModel)]="loginData.username"
                name="username"
                required
                placeholder="Enter username"
                [disabled]="isLoading()"
              />
            </div>

            <div class="mb-4 text-start">
              <label class="form-label small fw-bold">Password</label>
              <input
                type="password"
                class="form-control"
                [(ngModel)]="loginData.password"
                name="password"
                required
                placeholder="••••••••"
                [disabled]="isLoading()"
              />
            </div>

            @if (errorMessage()) {
              <div class="alert alert-danger py-2 small border-0">
                {{ errorMessage() }}
              </div>
            }

            <button
              type="submit"
              class="btn btn-primary w-100 py-2 fw-bold"
              [disabled]="loginForm.invalid || isLoading()"
            >
              @if (isLoading()) {
                <span
                  class="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
              }

              {{ isLoading() ? 'Signing in...' : 'Login' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  loginData = { username: '', password: '' };
  errorMessage = signal<string | null>(null);
  isLoading = signal<boolean>(false); // NEW: Track loading state

  onLogin() {
    this.errorMessage.set(null);
    this.isLoading.set(true); // Start spinner

    this.authService
      .login(this.loginData)
      .pipe(
        // finalize runs whether the call succeeds OR fails
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          if (err.status === 401) {
            this.errorMessage.set('Invalid username or password.');
          } else {
            this.errorMessage.set('Server connection failed. Try again.');
          }
        },
      });
  }
}
