import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';
import { LoggerService } from '../services/logger.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
	const authService = inject(AuthService);
	const logger = inject(LoggerService);
	const token = localStorage.getItem('token');

	// Define paths that should NOT trigger a global error log
	const isAuthRequest = req.url.includes('/auth/login') || req.url.includes('/auth/token');
	const isLogRequest = req.url.includes('/auth/logs');

	// 1. Attach the token if it exists (Your original logic)
	let authReq = req;
	if (token) {
		authReq = req.clone({
			setHeaders: { Authorization: `Bearer ${token}` }
		});
	}

	// 2. Handle the response and catch 401 errors
	return next(authReq).pipe(
		catchError((error: HttpErrorResponse) => {
			// 1. Only send to LoggerService if it's a REAL app error (not a login fail or log fail)
			if (!isAuthRequest && !isLogRequest) {
				logger.error(`API Error: ${req.url}`, error);
			}

			if (error.status === 401) {
				console.warn('Unauthorized request - Logging out...');
				authService.logout(); // This clears localStorage and redirects to /login
			}
			return throwError(() => error);
		})
	);
};