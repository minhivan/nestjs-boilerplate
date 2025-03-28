import { HttpException, HttpStatus } from '@nestjs/common';
import { HttpErrorByCode } from '@nestjs/common/utils/http-error-by-code.util';
import axios from 'axios';

export function handleAxiosError(
	error: any,
	defaultMessage: string = `There was an error processing your request! Please try again later.`,
) {
	console.log(error);

	if (axios.isAxiosError(error)) {
		const detailsError = error.response?.data || error.message;
		const statusCode =
			error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;

		throw new HttpException(
			{
				statusCode,
				error: HttpErrorByCode[statusCode].name,
				message: defaultMessage,
				details: detailsError,
			},
			statusCode,
		);
	} else {
		// Handle non-Axios error (programming or unexpected errors)
		throw new HttpException(
			{
				statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
				error: HttpErrorByCode[HttpStatus.INTERNAL_SERVER_ERROR].name,
				message: defaultMessage,
				details: error.message,
			},
			HttpStatus.INTERNAL_SERVER_ERROR,
		);
	}
}

export function handleOTAError(error: any) {
	const statusCode =
		error.response.status || HttpStatus.INTERNAL_SERVER_ERROR;
	const errorData = error.response?.data;

	throw new HttpException(
		{
			// message:
			error: errorData?.error || HttpErrorByCode[statusCode].name,
			message: errorData?.debug?.validation_error || 'An error occurred',
		},
		statusCode,
	);
}

export function handleDirectusError(error: any) {
	const responseData = error.response?.data;
	// const detailsError = error.response?.data || error.message;
	const detailsError = responseData?.errors?.map(
		(err: any) => err.message,
	) || [error.message];
	const statusCode =
		error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;

	throw new HttpException(
		{
			statusCode,
			error: HttpErrorByCode[statusCode].name,
			message: detailsError,
			details: responseData,
		},
		statusCode,
	);
}

export function handleServiceError(error: any) {
	const statusCode =
		error?.response?.status ||
		error?.response?.statusCode ||
		HttpStatus.INTERNAL_SERVER_ERROR;
	const errorData = error.response?.data;

	throw new HttpException(
		{
			error: errorData?.error || HttpErrorByCode[statusCode].name,
			message: errorData?.message || 'An error occurred',
		},
		statusCode,
	);
}
