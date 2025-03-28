import { CacheModuleOptions, CacheStore } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';

export const getRedisConfig = async (
	configService: ConfigService,
): Promise<CacheModuleOptions> => {
	const store = await redisStore({
		url: configService.get<string>('REDIS_URL'),
		socket: {
			reconnectStrategy: (retries) => {
				console.log(`Redis reconnect attempt #${retries}`);
				if (retries > 5) {
					console.error('Max retries reached. Exiting...');
					return new Error('Redis connection failed');
				}
				return Math.min(retries * 100, 3000); // Exponential backoff
			},
			keepAlive: 30000,
		},
	});

	return {
		store: store as unknown as CacheStore,
		ttl: 60 * 60000, // 1 hour (milliseconds)
	};
};
