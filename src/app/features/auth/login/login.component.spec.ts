import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('LoginComponent', () => {
	let component: LoginComponent;
	let fixture: ComponentFixture<LoginComponent>;
	let authServiceMock: any;
	let routerMock: any;

	beforeEach(async () => {
		// 1. Create Mocks
		authServiceMock = {
			login: vi.fn(),
		};
		routerMock = {
			navigate: vi.fn(),
		};

		await TestBed.configureTestingModule({
			imports: [LoginComponent, FormsModule, CommonModule],
			providers: [
				{ provide: AuthService, useValue: authServiceMock },
				{ provide: Router, useValue: routerMock },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(LoginComponent);
		component = fixture.componentInstance;
		fixture.detectChanges(); // Initial render
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	// it('should disable the button when form is invalid', async () => {
	// 	const button = fixture.nativeElement.querySelector('button');

	// 	// Initial state: empty fields = invalid
	// 	expect(button.disabled).toBe(true);

	// 	component.loginData = { username: 'suhas', password: 'password123' };
	// 	fixture.detectChanges();
	// 	await fixture.whenStable(); // Wait for NgModel updates

	// 	expect(button.disabled).toBe(false);
	// });

	it('should show spinner and navigate on successful login', () => {
		authServiceMock.login.mockReturnValue(of({ token: 'fake-jwt' }));

		component.onLogin();

		// Check if loading state was triggered (before finalize)
		// Since of() is synchronous, finalize might have already run.
		// To test intermediate loading, you'd need a delayed observable.
		expect(authServiceMock.login).toHaveBeenCalledWith(component.loginData);
		expect(routerMock.navigate).toHaveBeenCalledWith(['/dashboard']);
		expect(component.isLoading()).toBe(false); // finalize set it back
	});

	it('should show specific error message on 401 Unauthorized', () => {
		authServiceMock.login.mockReturnValue(throwError(() => ({ status: 401 })));

		component.onLogin();
		fixture.detectChanges(); // Update template to show @if (errorMessage())

		expect(component.errorMessage()).toBe('Invalid username or password.');
		const alert = fixture.nativeElement.querySelector('.alert-danger');
		expect(alert.textContent).toContain('Invalid username or password.');
	});

	it('should show generic error message on server failure', () => {
		authServiceMock.login.mockReturnValue(throwError(() => ({ status: 500 })));

		component.onLogin();
		fixture.detectChanges();

		expect(component.errorMessage()).toBe('Server connection failed. Try again.');
		expect(component.isLoading()).toBe(false);
	});

	// it('should disable inputs while loading', () => {
	// 	component.isLoading.set(true);
	// 	fixture.detectChanges();

	// 	// Cast to HTMLInputElement to access the .disabled property correctly
	// 	const usernameInput = fixture.nativeElement.querySelector(
	// 		'input[name="username"]',
	// 	) as HTMLInputElement;

	// 	expect(usernameInput.disabled).toBe(true);
	// });
});
