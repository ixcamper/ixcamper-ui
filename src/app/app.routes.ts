import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
	// 1. Eager Load (Login is small, load it immediately)
	{ path: 'login', component: LoginComponent },

	// 2. Lazy Load (Dashboard is only loaded AFTER login + guard check)
	{
		path: 'dashboard',
		loadComponent: () => import('./features/dashboard/dashboard.component')
			.then(m => m.DashboardComponent),
		canActivate: [authGuard]
	},

	// 3. Lazy Load Settings (Optional)
	{
		path: 'settings',
		loadComponent: () => import('./features/settings/settings.component')
			.then(m => m.SettingsComponent),
		canActivate: [authGuard]
	},

	{ path: '', redirectTo: '/dashboard', pathMatch: 'full' },
	{ path: '**', redirectTo: '/dashboard' }
];