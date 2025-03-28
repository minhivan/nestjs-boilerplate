import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import {
	Injectable,
	CanActivate,
	ExecutionContext,
	UnauthorizedException,
	Inject,
	BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { REQUIRE_CHANNEL_KEY } from 'src/common/decorators/require-channel.decorator';
import { DIRECTUS_ENDPOINT } from 'src/enums/directus-endpoints.enum';
import { DirectusService } from 'src/integrations/directus/directus.service';

@Injectable()
export class ChannelGuard implements CanActivate {
	constructor(
		private reflector: Reflector,
		private directusService: DirectusService,
		private configService: ConfigService,
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		// Check if the route is decorated with @RequireChannel()
		const requireChannel = this.reflector.get<boolean>(
			REQUIRE_CHANNEL_KEY,
			context.getHandler(),
		);

		// If the route doesn't require channel verification, allow access
		if (!requireChannel) {
			return true;
		}

		const request = context.switchToHttp().getRequest();
		const channelId = request.headers['x-channel-id'];

		if (!channelId) {
			throw new BadRequestException('Channel ID is required');
		} else {
			const channelData = await this.getCachedChannel(channelId);
			if (!channelData) {
				throw new BadRequestException('Channel ID is invalid');
			}
		}

		// Add channelId to request object for use in controllers
		request.channelId = channelId;
		return true;
	}

	private async getCachedChannel(channelId: string): Promise<any> {
		const cacheKey = `channel:${channelId}`;
		// Attempt to retrieve cached user data
		const cachedUserData = await this.cacheManager.get<string>(cacheKey);
		if (cachedUserData) return JSON.parse(cachedUserData);

		// If not in cache, call Directus
		try {
			const { data: channelData } =
				await this.directusService.retrieveItem(
					DIRECTUS_ENDPOINT.CHANNEL,
					channelId,
					null,
					this.configService.get<string>('DIRECTUS_TOKEN'),
				);

			// Cache the user data with TTL
			await this.cacheManager.set(
				cacheKey,
				JSON.stringify(channelData),
				1000 * 60 * 5,
			); // Cache for 5 minutes
			return channelData;
		} catch (error) {
			// Clear cache in case of error to avoid stale data on token failure
			await this.cacheManager.del(cacheKey);
			return null;
		}
	}
}
