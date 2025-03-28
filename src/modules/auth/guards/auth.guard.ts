import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
	CanActivate,
	ExecutionContext,
	Inject,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Request } from 'express';
import { DIRECTUS_ENDPOINT } from 'src/enums/directus-endpoints.enum';
import { DirectusService } from 'src/integrations/directus/directus.service';
import { IS_PUBLIC_KEY } from '../../../common/decorators/public.decorator';
// import { IS_PUBLIC_KEY } from './decorators/public.decorator';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(
		private directusService: DirectusService,
		private jwtService: JwtService,
		private reflector: Reflector,
		private configService: ConfigService,
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
	) {}

	// async canActivate(context: ExecutionContext): Promise<boolean> {
	// 	const request = context.switchToHttp().getRequest();
	// 	const token = this.extractTokenFromHeader(request);

	// 	if (!token) {
	// 		throw new UnauthorizedException('Missing token');
	// 	}

	// 	// Retrieve user data
	// 	const cacheKey = `user:${token}`;
	// 	const userData = await this.getCachedUser(cacheKey, token);

	// 	if (!userData) {
	// 		throw new UnauthorizedException('Invalid or expired token');
	// 	}

	// 	// 💡 We're assigning the payload to the request object here
	// 	// so that we can access it in our route handlers
	// 	request['user'] = userData;
	// 	request['token'] = token;
	// 	return true;
	// }

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const isPublic = this.reflector.getAllAndOverride<boolean>(
			IS_PUBLIC_KEY,
			[context.getHandler(), context.getClass()],
		);
		if (isPublic) {
			// 💡 See this condition
			return true;
		}

		const request = context.switchToHttp().getRequest();
		const token = this.extractTokenFromHeader(request);
		if (!token) {
			throw new UnauthorizedException();
		}
		try {
			const payload = await this.jwtService.verifyAsync(token, {
				secret: this.configService.get<string>('JWT_SECRET'),
			});

			// Retrieve user data
			const cacheKey = `user:${payload.id}`;
			const userData = await this.getCachedUser(cacheKey, token);

			// 💡 We're assigning the payload to the request object here
			// so that we can access it in our route handlers
			request['user'] = userData;
			request['token'] = token;
		} catch {
			throw new UnauthorizedException();
		}
		return true;
	}

	private extractTokenFromHeader(request: Request): string | undefined {
		const [type, token] = request.headers.authorization?.split(' ') ?? [];
		return type === 'Bearer' ? token : undefined;
	}

	private async getCachedUser(cacheKey: string, token: string) {
		// Attempt to retrieve cached user data
		const cachedUserData = await this.cacheManager.get<string>(cacheKey);
		if (cachedUserData) return JSON.parse(cachedUserData);

		// If not in cache, call Directus
		try {
			const { data } = await this.directusService.fetchData(
				`${DIRECTUS_ENDPOINT.USER}/me/`,
				'GET',
				{ fields: '*' },
				undefined,
				token,
			);

			// Cache the user data with TTL
			await this.cacheManager.set(
				cacheKey,
				JSON.stringify(data),
				300 * 1000,
			); // Cache for 5 minutes
			return data;
		} catch (error) {
			// Clear cache in case of error to avoid stale data on token failure
			await this.cacheManager.del(cacheKey);
			return null;
		}
	}
}
