import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
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
	private readonly AUTH_URL = `${environment.gatewayUrl}/auth`;

	// Using Angular Signals to track auth state (Modern Angular 21 approach)
	currentUser = signal<string | null>(localStorage.getItem('username'));

	login(credentials: { username: string; password: string }): Observable<LoginResponse> {
		return this.http.post<LoginResponse>(`${this.AUTH_URL}/token`, credentials).pipe(
			tap((res) => {
				this.setSession(res);
			})
		);
	}

	logout(): void {
		localStorage.removeItem('token');
		localStorage.removeItem('username');
		this.currentUser.set(null);
	}

	private setSession(authResult: LoginResponse): void {
		localStorage.setItem('token', authResult.token);
		localStorage.setItem('username', authResult.username);
		this.currentUser.set(authResult.username);
	}

	public isLoggedIn(): boolean {
		return !!localStorage.getItem('token');
	}

	public getToken(): string | null {
		return localStorage.getItem('token');
	}
}