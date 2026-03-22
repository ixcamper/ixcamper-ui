import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { inject, runInInjectionContext } from '@angular/core';
import { LoggerService } from './app/core/services/logger.service';

bootstrapApplication(AppComponent, appConfig)
	.then((appRef) => {
		// Application is ready, now we can use inject() via runInInjectionContext
		runInInjectionContext(appRef.injector, () => {
			const logger = inject(LoggerService);
			logger.info('Application bootstrapped successfully');
		});
	})
	.catch((err) => {
		// If bootstrap FAILS, the Injector doesn't exist yet.
		// Use standard console for fatal startup errors.
		console.error('FATAL: Failed to bootstrap application', err);
	});
