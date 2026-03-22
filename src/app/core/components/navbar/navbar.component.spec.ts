import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavbarComponent } from './navbar.component';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ProfileService, UserProfile } from '../../services/profile.service';
import { of, throwError } from 'rxjs';
import { LoggerService } from '../../services/logger.service';

const mockAuthService = {
	isLoggedIn: vi.fn(),
	logout: vi.fn(),
};

const mockProfileService = {
	getProfile: vi.fn().mockReturnValue(of({} as UserProfile)),
};

const mockLoggerService = {
	error: vi.fn(),
};

describe('NavbarComponent', () => {
	let component: NavbarComponent;
	let fixture: ComponentFixture<NavbarComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [NavbarComponent],
			providers: [
				provideRouter([]),
				{ provide: AuthService, useValue: mockAuthService },
				{ provide: ProfileService, useValue: mockProfileService },
				{ provide: LoggerService, useValue: mockLoggerService },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(NavbarComponent);
		component = fixture.componentInstance;
		await fixture.whenStable();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should load user profile when logged in', () => {
		const loadUserProfileSpy = vi.spyOn(component, 'loadUserProfile');
		loadUserProfileSpy.mockImplementationOnce(() => Promise.resolve());
		mockAuthService.isLoggedIn.mockReturnValue(true);
		fixture.detectChanges();
		component.ngOnInit();
		expect(loadUserProfileSpy).toHaveBeenCalled();
	});

	it('should not load user profile when logged in', () => {
		const loadUserProfileSpy = vi.spyOn(component, 'loadUserProfile');
		loadUserProfileSpy.mockImplementationOnce(() => Promise.resolve());
		mockAuthService.isLoggedIn.mockReturnValue(false);
		fixture.detectChanges();
		component.ngOnInit();
		expect(loadUserProfileSpy).not.toHaveBeenCalled();
	});

	describe('loadUserProfile', () => {
		let getProfileSpy: ReturnType<typeof vi.spyOn>;
		beforeEach(() => {
			mockAuthService.isLoggedIn.mockReturnValue(true);
			getProfileSpy = vi.spyOn(mockProfileService, 'getProfile');
		});

		it('should load user profile successfully', () => {
			const mockUserProfile: UserProfile = {
				username: 'testuser',
				email: 'testuser@example.com',
				roles: ['ADMIN'],
			};
			const getProfileSpy = vi.spyOn(mockProfileService, 'getProfile');
			getProfileSpy.mockReturnValue(of(mockUserProfile));
			fixture.detectChanges();
			component.loadUserProfile();
			expect(component.userProfile()).toEqual(mockUserProfile);
		});

		it('should handle error when loading user profile fails', () => {
			const loggerErrorSpy = vi.spyOn(mockLoggerService, 'error');
			const errorResponse = { status: 401, message: 'Unauthorized' };
			mockProfileService.getProfile.mockReturnValue(throwError(() => errorResponse));
			fixture.detectChanges();
			component.loadUserProfile();
			expect(loggerErrorSpy).toHaveBeenCalledWith(
				'Failed to load user profile in Navbar',
				errorResponse,
			);
		});
	});

	describe('onLogout', () => {
		it('should be called on logout button click', () => {
			const onLogoutSpy = vi.spyOn(component, 'onLogout');
			onLogoutSpy.mockImplementationOnce(() => {});
			fixture.detectChanges();
			const logoutButton = fixture.nativeElement.querySelector('.btn-logout');
			logoutButton.click();
			expect(onLogoutSpy).toHaveBeenCalled();
		});

		it('should call authService.logout and navigate to login', () => {
			const logoutSpy = vi.spyOn(mockAuthService, 'logout');
			const navigateSpy = vi.spyOn(component['router'], 'navigate');
			component.onLogout();
			expect(logoutSpy).toHaveBeenCalled();
			expect(navigateSpy).toHaveBeenCalledWith(['/login']);
		});
	});
});
