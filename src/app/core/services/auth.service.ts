import { inject, Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../../environments/environment';

interface LoginResponse {
	token: string;
	username: string;
}

@Injectable({
	providedIn: 'root',
})
export class AuthService {
	private http = inject(HttpClient);
	private router = inject(Router);
	private readonly AUTH_URL = `${environment.gatewayUrl}/auth`;

	// --- SIGNALS (The source of truth for your UI) ---
	private tokenSignal = signal<string | null>(localStorage.getItem('token'));
	private userSignal = signal<string | null>(localStorage.getItem('username'));

	// Computed signals allow other components to "listen" to changes automatically
	public currentUser = computed(() => this.userSignal());

	private logoutTimer: any;

	constructor() {
		// If a token exists on app load, validate it and start the countdown
		const savedToken = this.tokenSignal();
		if (savedToken) {
			this.autoLogout(savedToken);
		}
	}

	/**
	 * Authenticates the user and sets the session
	 */
	login(credentials: { username: string; password: string }): Observable<LoginResponse> {
		return this.http.post<LoginResponse>(`${this.AUTH_URL}/token`, credentials).pipe(
			tap((res) => this.setSession(res))
		);
	}

	/**
	 * Clears all local storage, stops timers, and redirects to Login
	 */
	logout(): void {
		localStorage.removeItem('token');
		localStorage.removeItem('username');

		// Update signals to notify the Navbar and Guards instantly
		this.tokenSignal.set(null);
		this.userSignal.set(null);

		if (this.logoutTimer) {
			clearTimeout(this.logoutTimer);
		}

		this.router.navigate(['/login']);
	}

	/**
	 * Validates if the user is currently logged in with a VALID token.
	 * This is what your AuthGuard calls.
	 */
	public isLoggedIn(): boolean {
		const token = this.tokenSignal();
		if (!token) return false;

		try {
			const decoded: any = jwtDecode(token);
			const isExpired = decoded.exp * 1000 < Date.now();

			if (isExpired) {
				this.logout(); // Cleanup if we find an expired token
				return false;
			}
			return true;
		} catch (e) {
			// This catches tampered/corrupted tokens (e.g., if you change a letter)
			console.error('Invalid token structure detected');
			return false;
		}
	}

	public getToken(): string | null {
		return this.tokenSignal();
	}

	private setSession(authResult: LoginResponse): void {
		localStorage.setItem('token', authResult.token);
		localStorage.setItem('username', authResult.username);

		this.tokenSignal.set(authResult.token);
		this.userSignal.set(authResult.username);

		this.autoLogout(authResult.token);
	}

	/**
	 * Decodes the JWT and sets a timeout to automatically log the user out
	 * exactly when the token expires.
	 */
	private autoLogout(token: string) {
		try {
			const decoded: any = jwtDecode(token);
			const expiryTime = decoded.exp * 1000;
			const timeLeft = expiryTime - Date.now();

			if (this.logoutTimer) {
				clearTimeout(this.logoutTimer);
			}

			if (timeLeft > 0) {
				this.logoutTimer = setTimeout(() => {
					console.warn('Session expired. Logging out.');
					this.logout();
				}, timeLeft);
			} else {
				this.logout(); // Token was already expired
			}
		} catch (e) {
			this.logout();
		}
	}
}