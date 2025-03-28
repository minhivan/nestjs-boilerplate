import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { DIRECTUS_ENDPOINT } from 'src/enums/directus-endpoints.enum';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import * as generator from 'generate-password';
import { DirectusService } from 'src/integrations/directus/directus.service';

@Injectable()
export class AuthService implements OnModuleInit {
	private googleClient: OAuth2Client;

	constructor(
		private directusService: DirectusService,
		private configService: ConfigService,
		private jwtService: JwtService,
	) {
		this.googleClient = new OAuth2Client(
			this.configService.get<string>('GOOGLE_CLIENT_ID'),
			this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
		);
	}
	onModuleInit() {
		// this.verifyIdToken(
		// 	'eyJhbGciOiJSUzI1NiIsImtpZCI6IjJjOGEyMGFmN2ZjOThmOTdmNDRiMTQyYjRkNWQwODg0ZWIwOTM3YzQiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI0MDc0MDg3MTgxOTIuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI0MDc0MDg3MTgxOTIuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDk2ODk2MDcwNzEyNjI3MTYzMzciLCJlbWFpbCI6Im1pbmgucG44MTFAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF0X2hhc2giOiJPSnMxQUhSQkQwd2p4aDJiWTFGYm13IiwibmFtZSI6Ik1pbmggUGhhbSIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NLallGdjFYaG12YWhCeERVNkVmOEE3bFI2eW1jWXRYZmNNMmZnckdtZ1ExRWdzYXRoUj1zOTYtYyIsImdpdmVuX25hbWUiOiJNaW5oIiwiZmFtaWx5X25hbWUiOiJQaGFtIiwiaWF0IjoxNzMzNzMyODQ2LCJleHAiOjE3MzM3MzY0NDZ9.eKYf19fvPij6t9G59HUPxAPHHcaOPUsfFju7hnpJTXl1dDdY07FVAZqRiOegcYntx-jPkBaxTooNE0ddQTF_KJTmBNGiWeL1NHL_KQziBw7oM9JHi2okRsR3Xla9QgoZaTlL5S8XWUM4rCGFeZWNYJGAxQgutSOl67SrMJNr6ZqDbVX0QtIVPlW4Y7y0-rsBt04kRiB7fd0TB950--LTBED2GJ3OVrLv-kvw8Xzk08OTZ5fdrOKInN02yzAeoBPmY8hHeyTfr11rbMmVbV7QqAEE_xvcAciH6Jl806SuzwJmq5TKHYLJmBBJcSzlPPR6FWvbAZTyiWV0rDuqnefbfQ',
		// );
	}

	/**
	 *
	 *
	 * @param {string} email
	 * @param {string} password
	 * @returns {Promise<any>}
	 *
	 * @memberOf AuthService
	 */
	async signIn(email: string, password: string): Promise<any> {
		const data = await this.directusService.fetchData(
			DIRECTUS_ENDPOINT.AUTH_LOGIN,
			'POST',
			undefined,
			{ email, password },
		);
		return data;
	}

	/**
	 *
	 *
	 * @param {string} email
	 * @param {string} password
	 * @returns {Promise<any>}
	 *
	 * @memberOf AuthService
	 */
	async validateUser(email: string, password: string): Promise<any> {
		const { data } = await this.directusService.fetchData(
			DIRECTUS_ENDPOINT.AUTH_LOGIN,
			'POST',
			undefined,
			{ email, password },
		);

		if (!data) return;
		const { data: userData } = await this.directusService.fetchData(
			`${DIRECTUS_ENDPOINT.USER}/me/`,
			'GET',
			{ fields: '*' },
			undefined,
			data.access_token,
		);
		return { ...userData, refresh_token: data.refresh_token };
	}

	async refreshToken(refreshToken: string): Promise<any> {
		const data = await this.directusService.fetchData(
			DIRECTUS_ENDPOINT.AUTH_REFRESH,
			'POST',
			undefined,
			{ refresh_token: refreshToken, mode: 'json' },
		);

		return data;
	}

	/**
	 *
	 *
	 * @param {string} email
	 * @param {string} password
	 * @returns {Promise<any>}
	 *
	 * @memberOf AuthService
	 */
	async registerUser(email: string, password: string): Promise<any> {
		// Perform register user
		try {
			const { data: registerUser } = await this.directusService.fetchData(
				DIRECTUS_ENDPOINT.USER,
				'POST',
				undefined,
				{
					email,
					password,
					role: this.configService.get<string>('DEFAULT_USER_ROLE'),
				},
				this.configService.get('DIRECTUS_TOKEN'),
			);
			return this.generateJWT(registerUser);
		} catch (error) {
			throw new BadRequestException(
				'This email address is already associated with an account. Try logging in or resetting your password.',
			);
		}
	}

	/**
	 *
	 *
	 * @param {*} user
	 * @returns
	 *
	 * @memberOf AuthService
	 */
	async generateJWT(user: any) {
		const payload = {
			id: user.id,
			role: user.role,
			membership: user.membership,
			email: user.email,
			app_access: false,
			admin_access: false,
			iss: 'directus',
		};
		return {
			data: {
				refresh_token: user.refresh_token,
				access_token: this.jwtService.sign(payload),
			},
		};
	}

	/**
	 *
	 *
	 * @param {string} token
	 * @returns
	 *
	 * @memberOf AuthService
	 */
	async verifyIdToken(token: string) {
		// Verify Google ID token
		const ticket = await this.googleClient.verifyIdToken({
			idToken: token,
			// audience: this.configService.get('GOOGLE_CLIENT_ID'),
		});

		// Extract user information
		const payload = ticket.getPayload();

		// Get user data from payload
		const query = {
			filter: { email: { _eq: payload.email } },
			fields: '*',
		};
		const { data: userData } = await this.directusService.fetchData(
			DIRECTUS_ENDPOINT.USER,
			'GET',
			query,
			undefined,
			this.configService.get('DIRECTUS_TOKEN'),
		);

		if (!userData || !userData.length) {
			const password = generator.generate({
				length: 12,
				numbers: true,
				symbols: true,
				uppercase: true,
				lowercase: true,
			});
			const { data: registerUser } = await this.directusService.fetchData(
				DIRECTUS_ENDPOINT.USER,
				'POST',
				undefined,
				{
					email: payload.email,
					password,
					role: this.configService.get<string>('DEFAULT_USER_ROLE'),
				},
				this.configService.get('DIRECTUS_TOKEN'),
			);
			return this.generateJWT(registerUser);
		} else {
			return this.generateJWT(userData[0]);
		}
	}
}
