import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UserProfile {
	username: string;
	email: string;
	roles: string[];
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
	private http = inject(HttpClient);
	private readonly API_URL = `${environment.gatewayUrl}/auth/me`;

	getProfile(): Observable<UserProfile> {
		// The Interceptor will automatically attach the Bearer token here
		return this.http.get<UserProfile>(this.API_URL);
	}
}
