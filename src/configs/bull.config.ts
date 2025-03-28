import { ConfigService } from '@nestjs/config';
import { BullModuleOptions } from '@nestjs/bull';

export const getBullConfig = async (
	configService: ConfigService,
): Promise<BullModuleOptions> => ({
	url: configService.get<string>('REDIS_URL'),
	defaultJobOptions: {
		attempts: 3,
		backoff: {
			type: 'exponential',
			delay: 1000,
		},
		removeOnComplete: true,
	},
});
