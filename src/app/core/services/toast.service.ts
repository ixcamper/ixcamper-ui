import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ToastService {
	message = signal<string | null>(null);
	type = signal<'success' | 'danger'>('success');

	show(msg: string, type: 'success' | 'danger' = 'success') {
		this.message.set(msg);
		this.type.set(type);

		// Auto-hide after 3 seconds
		setTimeout(() => {
			this.message.set(null);
		}, 3000);
	}
}
