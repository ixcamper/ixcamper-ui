import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';
import { LoggerService } from '../services/logger.service';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('authGuard', () => {
	// Mock Services
	const mockAuthService = {
		isLoggedIn: vi.fn(),
	};

	const mockLogger = {
		info: vi.fn(),
		error: vi.fn(),
	};

	const mockRouter = {
		createUrlTree: vi.fn(),
	};

	// Mock Router State
	const mockRoute = {} as ActivatedRouteSnapshot;
	const mockState = { url: '/dashboard' } as RouterStateSnapshot;

	beforeEach(() => {
		vi.clearAllMocks();
		vi.spyOn(Storage.prototype, 'removeItem');

		TestBed.configureTestingModule({
			providers: [
				{ provide: AuthService, useValue: mockAuthService },
				{ provide: LoggerService, useValue: mockLogger },
				{ provide: Router, useValue: mockRouter },
			],
		});
	});

	it('should grant access (return true) when token is valid', () => {
		mockAuthService.isLoggedIn.mockReturnValue(true);

		const result = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));
		``;

		expect(result).toBe(true);
		expect(mockLogger.info).toHaveBeenCalledWith('✅ ACCESS GRANTED');
	});

	it('should deny access and return UrlTree when token is invalid', () => {
		mockAuthService.isLoggedIn.mockReturnValue(false);
		const mockUrlTree = {} as UrlTree;
		mockRouter.createUrlTree.mockReturnValue(mockUrlTree);

		const result = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

		// Verify Redirect
		expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/login'], {
			queryParams: { returnUrl: '/dashboard' },
		});
		expect(result).toBe(mockUrlTree);

		// Verify Cleanup
		expect(localStorage.removeItem).toHaveBeenCalledWith('token');
		expect(localStorage.removeItem).toHaveBeenCalledWith('username');
		expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('ACCESS DENIED'));
	});
});
