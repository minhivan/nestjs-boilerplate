// // interceptors/search-cache.interceptor.ts
// import {
// 	Injectable,
// 	NestInterceptor,
// 	ExecutionContext,
// 	CallHandler,
// } from '@nestjs/common';
// import { Observable } from 'rxjs';
// import { tap } from 'rxjs/operators';
// import { HotelSearchDto } from '../dto/search-params.dto';

// @Injectable()
// export class SearchCacheInterceptor implements NestInterceptor {
// 	constructor(private readonly cacheService: HotelRateCacheService) {}

// 	async intercept(
// 		context: ExecutionContext,
// 		next: CallHandler,
// 	): Promise<Observable<any>> {
// 		const request = context.switchToHttp().getRequest();
// 		const searchParams: HotelSearchDto = request.body;

// 		// Add cache-control headers
// 		const response = context.switchToHttp().getResponse();
// 		response.header('Cache-Control', 'public, max-age=300'); // 5 minutes

// 		return next.handle().pipe(
// 			tap(async (data) => {
// 				// Store in cache after successful response
// 				await this.cacheService.set(
// 					this.generateCacheKey(searchParams),
// 					data,
// 					300, // 5 minutes TTL
// 				);
// 			}),
// 		);
// 	}

// 	private generateCacheKey(params: HotelSearchDto): string {
// 		return `search:${JSON.stringify(params)}`;
// 	}
// }
