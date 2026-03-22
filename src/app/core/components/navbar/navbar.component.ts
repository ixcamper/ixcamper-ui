import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { ProfileService, UserProfile } from '../../services/profile.service';
import { LoggerService } from '../../services/logger.service';

@Component({
	selector: 'app-navbar',
	standalone: true,
	imports: [CommonModule, RouterLink, RouterLinkActive],
	template: `
    <nav class="navbar navbar-expand-lg border-bottom py-3">
		<div class="container-fluid px-4">
			<a class="navbar-brand fw-bold text-primary" routerLink="/dashboard">ixcamper</a>
			
			<button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#ixcamperNav">
			<span class="navbar-toggler-icon"></span>
			</button>

			<div class="collapse navbar-collapse" id="ixcamperNav">
  <ul class="navbar-nav me-auto mb-2 mb-lg-0">
    <li class="nav-item">
      <a class="nav-link" routerLink="/dashboard" routerLinkActive="active">Overview</a>
    </li>
    <li class="nav-item">
      <a class="nav-link" routerLink="/settings" routerLinkActive="active">Settings</a>
    </li>
  </ul>
  
  <div class="d-flex flex-column flex-lg-row align-items-start align-items-lg-center">
    
    <span class="navbar-text text-white-50 small mb-2 mb-lg-0 me-lg-4 d-flex align-items-center">
      <i class="bi bi-person-circle me-2 fs-5 text-white-50"></i>
      <span>Signed in as <strong class="text-white ms-1">{{ userProfile()?.username }}</strong></span>
    </span>

    <div class="vr d-none d-lg-block bg-white opacity-25 me-3" style="height: 20px;"></div>

    <button class="btn btn-outline-light btn-sm fw-bold px-3 shadow-sm" (click)="onLogout()">
      Logout
    </button>
  </div>
</div>
		</div>
	</nav>
  	`
})
export class NavbarComponent implements OnInit {
	private authService = inject(AuthService);
	private router = inject(Router);
	private profileService = inject(ProfileService);
	private logger = inject(LoggerService); 
	userProfile = signal<UserProfile | null>(null);

	ngOnInit() {
		// Only fetch if we are already logged in (have a token)
		if (this.authService.isLoggedIn()) {
			this.loadUserProfile();
		}
	}

	loadUserProfile() {
		this.profileService.getProfile().subscribe({
			next: (data) => this.userProfile.set(data),
			error: (err) => {
				this.logger.error('Failed to load user profile in Navbar', err);
			}
		});
	}

	onLogout() {
		// 1. Clear LocalStorage/Session
		this.authService.logout();
		// 2. Redirect to Login
		this.router.navigate(['/login']);
	}

}