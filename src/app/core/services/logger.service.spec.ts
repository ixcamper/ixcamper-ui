import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { LoggerService, LogLevel } from './logger.service';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('LoggerService', () => {
	let service: LoggerService;
	let httpMock: HttpTestingController;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [provideHttpClient(), provideHttpClientTesting(), LoggerService],
		});

		service = TestBed.inject(LoggerService);
		httpMock = TestBed.inject(HttpTestingController);

		// Spy on console to prevent polluting test output and verify calls
		vi.spyOn(console, 'log').mockImplementation(() => {});
		vi.spyOn(console, 'warn').mockImplementation(() => {});
	});

	afterEach(() => {
		httpMock.verify();
		vi.restoreAllMocks();
	});

	describe('Log Level Filtering', () => {
		it('should log DEBUG to console when in dev mode', () => {
			// isDevMode() is typically true during Vitest runs
			service.debug('debug message');
			expect(console.log).toHaveBeenCalledWith(
				expect.stringContaining('[DEBUG]'),
				expect.any(String),
				'debug message',
				expect.any(Array),
			);
		});

		it('should NOT send INFO logs to the server', () => {
			service.info('info message');
			// INFO (1) is < WARN (2), so no HTTP request
			httpMock.expectNone('/auth/logs');
		});
	});

	describe('Server Logging (Spring Boot Integration)', () => {
		it('should send WARN logs to the server with correct payload', () => {
			const msg = 'Potential issue';
			const extra = { code: 404 };

			service.warn(msg, extra);

			const req = httpMock.expectOne('/auth/logs');
			expect(req.request.method).toBe('POST');
			expect(req.request.body).toMatchObject({
				level: 'WARN',
				message: msg,
				details: JSON.stringify([extra]), // Service wraps ...extra in an array
				url: expect.any(String),
				timestamp: expect.any(String),
			});
			req.flush({});
		});

		it('should extract message property if an Error object is passed to error()', () => {
			const errorObj = new Error('Database Connection Failed');
			service.error('Critical Error', errorObj);

			const req = httpMock.expectOne('/auth/logs');
			expect(req.request.body.details).toBe('Database Connection Failed');
			req.flush({});
		});

		it('should handle server logging failures gracefully', () => {
			service.error('Test error');

			const req = httpMock.expectOne('/auth/logs');
			req.error(new ProgressEvent('Network Error'));

			expect(console.warn).toHaveBeenCalledWith('Cloud logging failed', expect.any(Object));
		});
	});

	describe('log()', () => {
		it('should return if #level is below the configured log level', () => {
			(service as any)['minLevel'] = LogLevel.WARN; // Set log level to WARN
			service.info('This should not log'); // INFO is below WARN

			expect(console.log).not.toHaveBeenCalled();
		});

		it('should log to console and send to server if level is at or above', () => {
			// 1. Force the minLevel to something predictable
			(service as any).minLevel = LogLevel.INFO;

			// 2. Call a level that is EQUAL or HIGHER (INFO >= INFO)
			service.info('test message');

			// 3. Check for the request
			// Note: In your service, only WARN and ERROR go to the server.
			// If you call .info(), even if it passes the minLevel check,
			// it won't trigger an HTTP call unless it's >= WARN.

			// To test the server sync, use WARN:
			service.warn('warning message');

			const req = httpMock.expectOne('/auth/logs');
			expect(req.request.method).toBe('POST');
			req.flush({});
		});
	});
});
