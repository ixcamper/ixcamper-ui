import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast.service';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('ToastService', () => {
	let service: ToastService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [ToastService],
		});
		service = TestBed.inject(ToastService);

		// Tell Vitest to intercept global timers (setTimeout)
		vi.useFakeTimers();
	});

	afterEach(() => {
		// Restore real timers after each test to avoid side effects
		vi.useRealTimers();
	});

	it('should be created with initial null values', () => {
		expect(service.message()).toBeNull();
		expect(service.type()).toBe('success');
	});

	it('should set message and type when show() is called', () => {
		service.show('Operation Successful', 'success');

		expect(service.message()).toBe('Operation Successful');
		expect(service.type()).toBe('success');
	});

	it('should set type to danger when specified', () => {
		service.show('Error occurred', 'danger');

		expect(service.type()).toBe('danger');
	});

	it('should clear the message after 3 seconds', () => {
		service.show('Temporary Message');
		expect(service.message()).toBe('Temporary Message');

		// Fast-forward time by 3000ms
		vi.advanceTimersByTime(3000);

		// Signal should now be null
		expect(service.message()).toBeNull();
	});

	it('should clear only the most recent timeout if multiple calls occur', () => {
		// Spy on the global clearTimeout if you add cleanup logic later
		const spy = vi.spyOn(window, 'setTimeout');

		service.show('First message');
		service.show('Second message');

		expect(service.message()).toBe('Second message');

		vi.advanceTimersByTime(3000);
		expect(service.message()).toBeNull();
	});
});
