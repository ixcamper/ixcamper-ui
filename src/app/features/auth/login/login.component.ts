import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
	selector: 'app-login',
	standalone: true,
	imports: [FormsModule],
	templateUrl: './login.component.html',
	styleUrl: './login.component.scss'
})
export class LoginComponent {
	private authService = inject(AuthService);
	private route = inject(ActivatedRoute);
	private router = inject(Router);

	loginData = { username: '', password: '' };

	onLogin() {
		this.authService.login(this.loginData).subscribe({
			next: () => {
				// Read the returnUrl from the query params, or default to /dashboard
				const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
				this.router.navigateByUrl(returnUrl);
			}
		});
	}
}