import { ApplicationConfig, inject, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { LoggerService } from './core/services/logger.service';

export const appConfig: ApplicationConfig = {
	providers: [
		provideBrowserGlobalErrorListeners(),
		provideRouter(routes),
		provideHttpClient(
			withInterceptors([
				(req, next) => {
					// This is a simple logging interceptor to show all outgoing requests in the console
					inject(LoggerService).info(`Outgoing request to: ${req.url}`);
					return next(req);
				},
				authInterceptor,
			]),
		),
	],
};
