import { HttpClient } from '@angular/common/http';
import { Injectable, inject, isDevMode } from '@angular/core';

export enum LogLevel {
	DEBUG = 0,
	INFO = 1,
	WARN = 2,
	ERROR = 3,
}

@Injectable({ providedIn: 'root' })
export class LoggerService {
	private http = inject(HttpClient);
	private readonly logApi = '/auth/logs'; // Routed via Gateway

	// In production, we only care about WARN and ERROR
	private readonly minLevel = isDevMode() ? LogLevel.DEBUG : LogLevel.WARN;

	debug(msg: string, ...extra: any[]): void {
		this.log(LogLevel.DEBUG, msg, extra);
	}

	info(msg: string, ...extra: any[]): void {
		this.log(LogLevel.INFO, msg, extra);
	}

	warn(msg: string, ...extra: any[]): void {
		this.log(LogLevel.WARN, msg, extra);
	}

	error(msg: string, error?: any): void {
		this.log(LogLevel.ERROR, msg, error);
	}

	private log(level: LogLevel, message: string, details?: any): void {
		if (level < this.minLevel) return;

		const label = LogLevel[level];

		// 1. Always log to browser console for the developer
		this.consoleLog(level, label, message, details);

		// 2. Send WARN and ERROR to Spring Boot (Server-side logging)
		if (level >= LogLevel.WARN) {
			this.sendToServer(label, message, details);
		}
	}

	private consoleLog(level: LogLevel, label: string, msg: string, details: any): void {
		const color =
			level === LogLevel.ERROR ? 'red' : level === LogLevel.WARN ? 'orange' : 'blue';
		console.log(`%c[${label}]`, `color: ${color}; font-weight: bold`, msg, details || '');
	}

	private sendToServer(level: string, message: string, details: any): void {
		const payload = {
			level,
			message,
			details: details?.message || JSON.stringify(details),
			url: window.location.href,
			timestamp: new Date().toISOString(),
		};

		// We don't pipe/map here because logging should be "fire and forget"
		this.http.post(this.logApi, payload).subscribe({
			error: (err) => console.warn('Cloud logging failed', err),
		});
	}
}
