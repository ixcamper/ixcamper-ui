import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
	const authService = inject(AuthService);
	const token = localStorage.getItem('token');

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
			if (error.status === 401) {
				console.warn('Unauthorized request - Logging out...');
				authService.logout(); // This clears localStorage and redirects to /login
			}
			return throwError(() => error);
		})
	);
};