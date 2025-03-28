import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, AxiosRequestConfig, Method } from 'axios';
import * as qs from 'qs';
import { DIRECTUS_ENDPOINT } from 'src/enums/directus-endpoints.enum';
import { AuthEmailLoginDto } from 'src/modules/auth/dtos/sign-in.dto';
import { handleDirectusError } from 'src/common/filters/http-exeption.filter';

@Injectable()
export class DirectusService implements OnModuleInit {
	private client: AxiosInstance;
	private logger = new Logger(DirectusService.name);
	constructor(private configurationService: ConfigService) {
		// Initialize the Axios client
		this.client = axios.create({
			baseURL: this.configurationService.get('DIRECTUS_HOST'),
			headers: {
				'Content-Type': 'application/json',
			},
		});
	}

	async onModuleInit() {
		this.logger.log('[*] Starting ping server Directus');
		this.checkConnection();
	}

	/**
	 * Check connection to Directus
	 */
	async checkConnection(): Promise<void> {
		try {
			const response = await this.client.get('/server/ping');
			if (response) this.logger.log(`[x] Ping server Directus: Done`);
		} catch (error) {
			this.logger.error('Error connecting to Directus:', error.message);
		}
	}

	async fetchData(
		endpoint: string,
		method: Method,
		query?: Record<string, any>,
		payload?: Record<string, any>,
		token?: string,
	) {
		try {
			const options: AxiosRequestConfig = {
				url: endpoint,
				params: query,
				method: method,
				data: payload,
			};
			if (token)
				options.headers = {
					Authorization: `Bearer ${token}`,
				};
			const { data: response } = await this.client(options);
			return response;
		} catch (error) {
			console.log(error);

			handleDirectusError(error);
		}
	}

	async authLoginByEmail(payload: AuthEmailLoginDto) {
		try {
			const { data: response } = await this.client.post(
				`${DIRECTUS_ENDPOINT.AUTH_LOGIN}`,
				payload,
			);
			return response;
		} catch (error) {
			handleDirectusError(error);
		}
	}

	/**
	 *
	 *
	 * @param {string} endpoint
	 * @param {Record<string, any>} [query]
	 * @param {string} [token]
	 * @returns
	 *
	 * @memberOf DirectusService
	 */
	async getItems(
		endpoint: string,
		query?: Record<string, any>,
		token?: string,
	) {
		// console.log(items);

		try {
			// Stringify the query parameters
			const stringifiedQuery = qs.stringify(query, {
				addQueryPrefix: true,
			});
			const { data: response } = await this.client.get(
				`${endpoint}${stringifiedQuery}`,
				{
					headers: {
						Authorization: token ? `Bearer ${token}` : undefined,
					},
				},
			);

			return response;
		} catch (error) {
			handleDirectusError(error);
		}
	}

	/**
	 *
	 *
	 * @param {string} endpoint
	 * @param {string} id
	 * @param {Record<string, any>} [data]
	 * @param {string} [token]
	 * @param {(response: any) => void} [callback]
	 * @returns
	 *
	 * @memberOf DirectusService
	 */
	async updateItem(
		endpoint: string,
		id: string,
		data?: Record<string, any>,
		token?: string,
		callback?: (response: any) => void,
	) {
		try {
			const { data: response } = await this.client.patch(
				`${endpoint}/${id}`,
				data,
				{
					headers: {
						Authorization: token ? `Bearer ${token}` : undefined,
					},
				},
			);
			if (callback && typeof callback === 'function') {
				callback(response);
			}
			return response;
		} catch (error) {
			this.logger.error(error);
			handleDirectusError(error);
		}
	}

	/**
	 *
	 *
	 * @param {string} endpoint
	 * @param {Record<string, any>} [data]
	 * @param {string} [token]
	 * @param {(response: any) => void} [callback]
	 * @returns
	 *
	 * @memberOf DirectusService
	 */
	async createItem(
		endpoint: string,
		data?: Record<string, any>,
		token?: string,
		callback?: (response: any) => void,
	) {
		try {
			const { data: response } = await this.client.post(
				`${endpoint}`,
				data,
				{
					headers: {
						Authorization: token ? `Bearer ${token}` : undefined,
					},
				},
			);
			if (callback && typeof callback === 'function') {
				callback(response);
			}
			return response;
		} catch (error) {
			handleDirectusError(error);
		}
	}

	/**
	 *
	 *
	 * @param {string} endpoint
	 * @param {string} id
	 * @param {Record<string, any>} [query]
	 * @param {string} [token]
	 * @returns
	 *
	 * @memberOf DirectusService
	 */
	async retrieveItem(
		endpoint: string,
		id: string,
		query?: Record<string, any>,
		token?: string,
	) {
		try {
			const stringifiedQuery = qs.stringify(query, {
				addQueryPrefix: true,
			});
			const { data: response } = await this.client.get(
				`${endpoint}/${id}${stringifiedQuery}`,
				{
					headers: {
						Authorization: token ? `Bearer ${token}` : undefined,
					},
				},
			);
			return response;
		} catch (error) {
			handleDirectusError(error);
		}
	}
}
