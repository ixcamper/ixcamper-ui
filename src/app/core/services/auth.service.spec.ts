import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { LoggerService } from './logger.service';
import { of } from 'rxjs';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as jwtDecodeModule from 'jwt-decode';

// 1. Mock the jwt-decode library
vi.mock('jwt-decode', () => ({
	jwtDecode: vi.fn(),
}));

describe('AuthService', () => {
	let service: AuthService;
	let httpMock: HttpTestingController;
	let router: Router;

	const mockLogger = {
		info: vi.fn(),
		warn: vi.fn(),
		error: vi.fn(),
	};

	const mockRouter = {
		navigate: vi.fn(),
	};

	beforeEach(() => {
		// Setup localStorage spies
		vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('my-token');
		vi.spyOn(Storage.prototype, 'setItem');
		vi.spyOn(Storage.prototype, 'removeItem');

		TestBed.configureTestingModule({
			providers: [
				provideHttpClient(),
				provideHttpClientTesting(),
				{ provide: LoggerService, useValue: mockLogger },
				{ provide: Router, useValue: mockRouter },
			],
		});

		httpMock = TestBed.inject(HttpTestingController);
		router = TestBed.inject(Router);
		service = TestBed.inject(AuthService);
	});

	afterEach(() => {
		httpMock.verify();
		vi.clearAllMocks();
		vi.useRealTimers(); // Reset timers if changed
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	describe('login()', () => {
		it('should call API and set session on success', () => {
			const mockRes = { token: 'fake-token', username: 'suhas' };
			const credentials = { username: 'suhas', password: '123' };

			// Mock jwtDecode for the autoLogout call that follows login
			(jwtDecodeModule.jwtDecode as any).mockReturnValue({
				exp: Math.floor(Date.now() / 1000) + 3600,
			});

			service.login(credentials).subscribe((res) => {
				expect(res).toEqual(mockRes);
			});

			const req = httpMock.expectOne((req) => req.url.includes('/auth/token'));
			expect(req.request.method).toBe('POST');
			req.flush(mockRes);

			// Verify storage and signals
			expect(localStorage.setItem).toHaveBeenCalledWith('token', 'fake-token');
			expect(service.currentUser()).toBe('suhas');
		});
	});

	describe('isLoggedIn()', () => {
		it('should return true if token is not expired', () => {
			const futureExp = Math.floor(Date.now() / 1000) + 1000;
			vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('valid-token');
			(jwtDecodeModule.jwtDecode as any).mockReturnValue({ exp: futureExp });

			expect(service.isLoggedIn()).toBe(true);
		});

		it('should return false and log warn if token is expired', () => {
			const pastExp = Math.floor(Date.now() / 1000) - 1000;
			vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('expired-token');
			(jwtDecodeModule.jwtDecode as any).mockReturnValue({ exp: pastExp });

			expect(service.isLoggedIn()).toBe(false);
			expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining('expired'));
		});

		it('should return false if token is unreadable', () => {
			vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('garbage');
			(jwtDecodeModule.jwtDecode as any).mockImplementation(() => {
				throw new Error('Invalid');
			});

			expect(service.isLoggedIn()).toBe(false);
			expect(mockLogger.error).toHaveBeenCalled();
		});

		it('should return false if token is null', () => {
			vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
			(jwtDecodeModule.jwtDecode as any).mockReturnValue(null);

			expect(service.isLoggedIn()).toBe(false);
		});
	});

	describe('logout()', () => {
		it('should clear storage, reset signals, and navigate to login', () => {
			service.logout();

			expect(localStorage.removeItem).toHaveBeenCalledWith('token');
			expect(localStorage.removeItem).toHaveBeenCalledWith('username');
			expect(service.currentUser()).toBeNull();
			expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
		});
	});

	describe('autoLogout()', () => {
		it('should automatically logout when timer expires', async () => {
			vi.useFakeTimers(); // Use Vitest's timer mock, not Angular's

			// Setup a token that expires in 5 seconds
			const now = Date.now();
			const fiveSeconds = 5000;
			const expiry = Math.floor((now + fiveSeconds) / 1000);

			(jwtDecodeModule.jwtDecode as any).mockReturnValue({ exp: expiry });

			// Trigger setSession which calls autoLogout
			service['setSession']({ token: 'abc', username: 'suhas' });

			// Fast-forward 5 seconds using Vitest
			vi.advanceTimersByTime(5000);

			expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
			expect(mockLogger.warn).toHaveBeenCalledWith('Session expired. Logging out.');

			vi.useRealTimers(); // Cleanup
		});

		it('should manage #logoutTimer is not null', () => {
			const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout');
			vi.useFakeTimers(); // Use Vitest's timer mock, not Angular's

			vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('my-token');
			service['logoutTimer'] = 'mock timer';
			service['setSession']({ token: 'abc', username: 'suhas' });

			vi.advanceTimersByTime(5000);

			expect(clearTimeoutSpy).toHaveBeenCalledWith('mock timer');
		});
	});

	describe('getToken()', () => {
		it('should return the token from localStorage', () => {
			vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('my-token');
			expect(service.getToken()).toBe('my-token');
		});
	});
});
