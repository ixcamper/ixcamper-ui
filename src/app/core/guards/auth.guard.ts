import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
	const authService = inject(AuthService);
	const router = inject(Router);

	console.log('--- 🛡️ GUARD CHECK START ---');
	console.log('Attempting to access:', state.url);

	const isTokenValid = authService.isLoggedIn();
	console.log('Is Token Valid (via AuthService)?', isTokenValid);

	if (isTokenValid) {
		console.log('✅ ACCESS GRANTED');
		console.log('--- 🛡️ GUARD CHECK END ---');
		return true;
	}

	// If we get here, the token failed validation
	console.error('❌ ACCESS DENIED: Token is missing, expired, or tampered.');
	console.log('--- 🛡️ GUARD CHECK END ---');

	// Clear the mess and send them home
	localStorage.removeItem('token');
	localStorage.removeItem('username');

	return router.createUrlTree(['/login'], {
		queryParams: { returnUrl: state.url }
	});
};