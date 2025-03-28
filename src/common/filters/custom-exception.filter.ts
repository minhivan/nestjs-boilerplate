import {
	ExceptionFilter,
	Catch,
	ArgumentsHost,
	HttpException,
	HttpStatus,
	Injectable,
} from '@nestjs/common';
import { HttpErrorByCode } from '@nestjs/common/utils/http-error-by-code.util';
import { FastifyReply } from 'fastify';

@Injectable()
@Catch()
export class GlobalResponseFilter implements ExceptionFilter {
	catch(exception: HttpException, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<FastifyReply>();

		const status =
			exception instanceof HttpException
				? exception.getStatus()
				: HttpStatus.INTERNAL_SERVER_ERROR;

		let error = HttpErrorByCode[500].name;
		let message = 'An error occured';

		if (exception instanceof HttpException) {
			const exceptionBody = exception.getResponse();
			message = exceptionBody['message'];
			error = exceptionBody['error'] || error;
		} else {
			message = exception['message'];
		}

		// Structure the response format
		const responseBody = {
			data: null,
			message,
			error,
			status: 'error',
		};

		response.status(status).send(responseBody);
	}
}
