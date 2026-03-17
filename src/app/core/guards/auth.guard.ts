import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
	const authService = inject(AuthService);
	const router = inject(Router);

	// Check if token exists in local storage (via the service)
	if (authService.isLoggedIn()) {
		return true;
	}

	// Not logged in: redirect to login and keep the attempted URL for later
	console.warn('Unauthorized access attempt to:', state.url);
	return router.createUrlTree(['/login'], {
		queryParams: { returnUrl: state.url }
	});
};