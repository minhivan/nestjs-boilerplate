import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class RateLimiterService {
	private readonly logger = new Logger(RateLimiterService.name);
	private requestCount = 0;
	private lastResetTime = Date.now();
	private readonly MAX_REQUESTS_PER_SECOND = 5; // Adjust based on your HERE API plan
	private readonly RESET_INTERVAL = 1000; // 1 second
	private readonly requestQueue: Array<() => Promise<any>> = [];
	private isProcessingQueue = false;

	constructor() {
		setInterval(() => {
			this.requestCount = 0;
			this.lastResetTime = Date.now();
		}, this.RESET_INTERVAL);
	}

	async executeWithRateLimit<T>(operation: () => Promise<T>): Promise<T> {
		if (this.canMakeRequest()) {
			this.requestCount++;
			return operation();
		}

		return new Promise((resolve, reject) => {
			this.requestQueue.push(async () => {
				try {
					const result = await operation();
					resolve(result);
				} catch (error) {
					reject(error);
				}
			});

			if (!this.isProcessingQueue) {
				this.processQueue();
			}
		});
	}

	private canMakeRequest(): boolean {
		return this.requestCount < this.MAX_REQUESTS_PER_SECOND;
	}

	private async processQueue() {
		if (this.isProcessingQueue || this.requestQueue.length === 0) {
			return;
		}

		this.isProcessingQueue = true;

		while (this.requestQueue.length > 0) {
			if (this.canMakeRequest()) {
				const request = this.requestQueue.shift();
				if (request) {
					this.requestCount++;
					await request();
				}
			} else {
				await new Promise((resolve) =>
					setTimeout(
						resolve,
						this.RESET_INTERVAL - (Date.now() - this.lastResetTime),
					),
				);
			}
		}

		this.isProcessingQueue = false;
	}
}
