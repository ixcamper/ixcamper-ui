import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { jwtDecode } from 'jwt-decode';

export const authGuard: CanActivateFn = (route, state) => {
	const authService = inject(AuthService);
	const router = inject(Router);
	const token = localStorage.getItem('token');

	// 1. Basic Check: Does the token exist?
	if (token) {
		try {
			// 2. Structural & Expiration Check
			// This fails if you change even one character in the token
			const decoded: any = jwtDecode(token);
			const isExpired = decoded.exp * 1000 < Date.now();

			if (!isExpired) {
				return true; // Token is valid, proceed to the route
			}

			console.warn('Token has expired.');
		} catch (error) {
			console.error('Token is malformed or corrupted:', error);
		}
	}

	// 3. Cleanup & Redirect
	// If we reach here, the token is missing, expired, or invalid
	console.warn('Unauthorized access to:', state.url);
	localStorage.removeItem('token');

	// Redirect to login and save the URL the user was trying to reach
	return router.createUrlTree(['/login'], {
		queryParams: { returnUrl: state.url }
	});
};