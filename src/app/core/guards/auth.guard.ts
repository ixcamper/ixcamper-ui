import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { LoggerService } from '../services/logger.service';

export const authGuard: CanActivateFn = (route, state) => {
	const authService = inject(AuthService);
	const logger = inject(LoggerService);
	const router = inject(Router);

	logger.info('--- 🛡️ GUARD CHECK START ---');
	logger.info('Attempting to access:', state.url);

	const isTokenValid = authService.isLoggedIn();
	logger.info('Is Token Valid (via AuthService)?', isTokenValid);

	if (isTokenValid) {
		logger.info('✅ ACCESS GRANTED');
		logger.info('--- 🛡️ GUARD CHECK END ---');
		return true;
	}

	// If we get here, the token failed validation
	logger.error('❌ ACCESS DENIED: Token is missing, expired, or tampered.');
	logger.info('--- 🛡️ GUARD CHECK END ---');

	// Clear the mess and send them home
	localStorage.removeItem('token');
	localStorage.removeItem('username');

	return router.createUrlTree(['/login'], {
		queryParams: { returnUrl: state.url },
	});
};
