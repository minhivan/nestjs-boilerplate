import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DIRECTUS_ENDPOINT } from 'src/enums/directus-endpoints.enum';
import { DirectusService } from 'src/integrations/directus/directus.service';
import { UserProfileInterface } from './interfaces/user-profile.interface';

@Injectable()
export class UsersService implements OnModuleInit {
	constructor(
		private configService: ConfigService,
		private directusService: DirectusService,
	) {}
	onModuleInit() {
		// this.syncUserIntoNovu();
	}

	async getUserProfiles(userId: string) {
		return this.directusService.retrieveItem(
			DIRECTUS_ENDPOINT.USER,
			userId,
		);
	}

	async updateUserReferences(
		userId: string,
		payload: UserProfileInterface,
		token?: string,
	) {
		return this.directusService.updateItem(
			`${DIRECTUS_ENDPOINT.USER}`,
			userId,
			payload,
			token || this.configService.get('DIRECTUS_TOKEN'),
		);
	}

	async syncUserIntoNovu() {
		// const response = await this.utilService.apiRequest<Record<string, any>>(
		// 	{
		// 		method: 'get',
		// 		path: `/users`,
		// 		headers: {
		// 			'Content-Type': 'application/json',
		// 			Authorization: `Bearer ${this.configService.get('DIRECTUS_TOKEN')}`,
		// 		},
		// 		baseUrl: this.configService.get('DIRECTUS_HOST'),
		// 	},
		// );
		// const { data: allUsers } = response;
		// console.log(allUsers);
	}
}
