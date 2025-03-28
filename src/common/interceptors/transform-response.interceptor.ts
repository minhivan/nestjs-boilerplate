import {
	Injectable,
	NestInterceptor,
	ExecutionContext,
	CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Define a basic response structure
export interface BaseResponse {
	status: string;
	error: any;
}

// Define our custom response type that extends the base
export type CustomResponse<T> = BaseResponse & {
	data: T;
	[key: string]: any; // Allow for additional properties
};

@Injectable()
export class TransformResponseInterceptor<T>
	implements NestInterceptor<T, CustomResponse<any>>
{
	intercept(
		context: ExecutionContext,
		next: CallHandler,
	): Observable<CustomResponse<any>> {
		return next.handle().pipe(
			map((responseData) => {
				// Check if the response is already formatted
				if (
					responseData &&
					typeof responseData === 'object' &&
					'data' in responseData
				) {
					// If it's already in the expected format, ensure it has required fields
					return {
						status: 'ok',
						error: null,
						...responseData,
					};
				}

				// Otherwise, use the default format
				return {
					data: responseData,
					status: 'ok',
					error: null,
				};
			}),
		);
	}
}
