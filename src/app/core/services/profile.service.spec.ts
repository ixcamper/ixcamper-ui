import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ProfileService, UserProfile } from './profile.service';
import { environment } from '../../../environments/environment';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('ProfileService', () => {
	let service: ProfileService;
	let httpMock: HttpTestingController;

	// Construct the expected URL exactly how the service does
	const expectedUrl = `${environment.gatewayUrl}/auth/me`;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [provideHttpClient(), provideHttpClientTesting(), ProfileService],
		});

		service = TestBed.inject(ProfileService);
		httpMock = TestBed.inject(HttpTestingController);
	});

	afterEach(() => {
		// Ensures no requests are left outstanding
		httpMock.verify();
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should fetch the user profile via GET', () => {
		const mockProfile: UserProfile = {
			username: 'suhas_dev',
			email: 'suhas@example.com',
			roles: ['ROLE_USER', 'ROLE_ADMIN'],
		};

		// 1. Call the service
		service.getProfile().subscribe((profile) => {
			expect(profile).toEqual(mockProfile);
			expect(profile.username).toBe('suhas_dev');
		});

		// 2. Expect a call to the environment-based URL
		const req = httpMock.expectOne(expectedUrl);
		expect(req.request.method).toBe('GET');

		// 3. Flush the mock data
		req.flush(mockProfile);
	});

	it('should handle an HTTP error gracefully', () => {
		service.getProfile().subscribe({
			next: () => expect.fail('Should have failed with 401, but the request succeeded'),
			error: (error) => {
				expect(error.status).toBe(401);
			},
		});

		const req = httpMock.expectOne(expectedUrl);
		req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
	});
});
