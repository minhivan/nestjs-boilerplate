import axios, { AxiosRequestConfig, Method } from 'axios';
import { createHmac } from 'crypto';
import { handleAxiosError } from 'src/common/filters/http-exeption.filter';

interface RequestOptions {
	method: Method;
	path: string;
	headers?: Record<string, string>;
	query?: Record<string, any>;
	body?: Record<string, any>;
	timeout?: number;
	baseUrl?: string;
}

/**
 *
 *
 * @template T
 * @param {RequestOptions} options
 * @returns {Promise<T>}
 *
 * @memberOf UtilsService
 */
export async function apiRequest(options: RequestOptions) {
	const {
		method,
		path,
		headers = {},
		query = {},
		body = null,
		timeout = 60000,
		baseUrl = '',
	} = options;

	const config: AxiosRequestConfig = {
		method,
		url: `${baseUrl}${path}`,
		headers,
		params: query,
		timeout,
	};

	if (options.body) config.data = body;

	try {
		const response = await axios(config);
		return response.data;
	} catch (error: any) {
		console.log(error.response?.data);
		handleAxiosError(
			error,
			'Internal Server Error. Failed to call external API.',
		);
	}
}

/**
 *
 *
 * @export
 * @param {Record<string, any>} object
 * @return {*}  {Record<string, any>}
 */
export function sortObjDataByKey(
	object: Record<string, any>,
): Record<string, any> {
	const orderedObject = Object.keys(object)
		.sort()
		.reduce((obj, key) => {
			obj[key] = object[key];
			return obj;
		}, {});
	return orderedObject;
}

/**
 *
 *
 * @param {Record<string, any>} object
 * @return {*}  {string}
 */
export function convertObjToQueryStr(object: Record<string, any>): string {
	return Object.keys(object)
		.filter((key) => object[key] !== undefined)
		.map((key) => {
			let value = object[key];
			// Sort nested object
			if (value && Array.isArray(value)) {
				value = JSON.stringify(
					value.map((val) => sortObjDataByKey(val)),
				);
			}
			// Set empty string if null
			if ([null, undefined, 'undefined', 'null'].includes(value)) {
				value = '';
			}

			return `${key}=${value}`;
		})
		.join('&');
}

/**
 *
 *
 * @export
 * @param {Record<string, any>} data
 * @param {string} currentSignature
 * @param {string} checksumKey
 * @return {*}  {boolean}
 */
export function isValidData(
	data: Record<string, any>,
	currentSignature: string,
	checksumKey: string,
): boolean {
	const sortedDataByKey = sortObjDataByKey(data);
	const dataQueryStr = convertObjToQueryStr(sortedDataByKey);
	const dataToSignature = createHmac('sha256', checksumKey)
		.update(dataQueryStr)
		.digest('hex');
	return dataToSignature == currentSignature;
}

/**
 *
 *
 * @export
 * @param {Record<string, any>} data
 * @param {string} checksumKey
 * @return {*}  {string}
 */
export function generateSignature(
	data: Record<string, any>,
	checksumKey: string,
): string {
	const sortedDataByKey = sortObjDataByKey(data);
	const dataQueryStr = convertObjToQueryStr(sortedDataByKey);
	const dataToSignature = createHmac('sha256', checksumKey)
		.update(dataQueryStr)
		.digest('hex');
	return dataToSignature;
}

export function generateCombinations(
	parts: string[],
): { hotelName: string; location: string }[] {
	const combinations: { hotelName: string; location: string }[] = [];

	for (let i = 1; i < parts.length; i++) {
		const hotelName = parts.slice(0, i).join(' ');
		const location = parts.slice(i).join(' ');
		combinations.push({ hotelName, location });
	}

	return combinations;
}

export function transformDirectusQuery(
	query: Record<string, any>,
): Record<string, any> {
	const queryParams: Record<string, any> = { filter: {} };

	// Handle sorting dynamically
	if (query.sort_by) {
		const orderPrefix = query.order === 'asc' ? '' : '-';
		queryParams['sort'] = `${orderPrefix}${query.sort_by}`;
	}

	// Convert flat query parameters into Directus-style filters
	for (const [key, value] of Object.entries(query)) {
		if (key !== 'sort_by' && key !== 'order') {
			queryParams.filter[key] = { _eq: value };
		}
	}

	return queryParams;
}
