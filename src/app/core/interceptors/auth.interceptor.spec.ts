import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';
import { LoggerService } from '../services/logger.service';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('authInterceptor', () => {
	let httpMock: HttpTestingController;
	let httpClient: HttpClient;

	const mockAuthService = {
		logout: vi.fn(),
	};

	const mockLogger = {
		error: vi.fn(),
	};

	beforeEach(() => {
		// Mock localStorage
		vi.spyOn(Storage.prototype, 'getItem');
		vi.spyOn(Storage.prototype, 'removeItem');

		TestBed.configureTestingModule({
			providers: [
				provideHttpClient(withInterceptors([authInterceptor])),
				provideHttpClientTesting(),
				{ provide: AuthService, useValue: mockAuthService },
				{ provide: LoggerService, useValue: mockLogger },
			],
		});

		httpMock = TestBed.inject(HttpTestingController);
		httpClient = TestBed.inject(HttpClient);
	});

	afterEach(() => {
		httpMock.verify(); // Ensures no outstanding requests
		vi.clearAllMocks();
	});

	it('should add Authorization header if token exists', () => {
		vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('fake-jwt-token');

		httpClient.get('/api/data').subscribe();

		const req = httpMock.expectOne('/api/data');
		expect(req.request.headers.has('Authorization')).toBe(true);
		expect(req.request.headers.get('Authorization')).toBe('Bearer fake-jwt-token');
	});

	it('should not add Authorization header if token is missing', () => {
		vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);

		httpClient.get('/api/data').subscribe();

		const req = httpMock.expectOne('/api/data');
		expect(req.request.headers.has('Authorization')).toBe(false);
	});

	it('should call logout and log warn on 401 error', () => {
		const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

		httpClient.get('/api/secure').subscribe({
			error: (err) => expect(err.status).toBe(401),
		});

		const req = httpMock.expectOne('/api/secure');
		req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

		expect(mockAuthService.logout).toHaveBeenCalled();
		expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Logging out'));
	});

	it('should log error for normal API requests but NOT for auth/login requests', () => {
		// 1. Test normal request (Should Log)
		httpClient.get('/api/products').subscribe({ error: () => {} });
		httpMock.expectOne('/api/products').flush({}, { status: 500, statusText: 'Server Error' });
		expect(mockLogger.error).toHaveBeenCalled();

		vi.clearAllMocks();

		// 2. Test auth request (Should NOT Log)
		httpClient.get('/auth/login').subscribe({ error: () => {} });
		httpMock.expectOne('/auth/login').flush({}, { status: 401, statusText: 'Bad Credentials' });
		expect(mockLogger.error).not.toHaveBeenCalled();
	});
});
