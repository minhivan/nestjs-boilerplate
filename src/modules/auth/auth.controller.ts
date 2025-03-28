import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Post,
	Put,
	Request,
	UseGuards,
} from '@nestjs/common';
import { AuthGuard } from './guards/auth.guard';
import { AuthService } from './auth.service';
import { AuthRegisterLoginDto } from './dtos/register.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Public } from '../../common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {}

	@UseGuards(LocalAuthGuard)
	@HttpCode(HttpStatus.OK)
	@Post('login')
	async signIn(@Request() req) {
		return this.authService.generateJWT(req.user);
	}

	@Post('register')
	async register(@Body() registerDto: AuthRegisterLoginDto) {
		return this.authService.registerUser(
			registerDto.email,
			registerDto.password,
		);
	}

	@Post('refresh')
	async refreshToken(@Body() refreshPayload: Record<string, any>) {
		return this.authService.refreshToken(refreshPayload.refresh_token);
	}

	@UseGuards(AuthGuard)
	@Get('me')
	async getProfile(@Request() req) {
		return req.user;
	}

	// @UseGuards(AuthGuard)
	@Post('verify-email')
	async verifyEmail(@Request() req) {
		return req.user;
	}

	// @UseGuards(AuthGuard)
	@Post('reset-password')
	async resetPassword(@Request() req) {
		return req.user;
	}

	// @UseGuards(AuthGuard)
	@Put('change-password')
	async changePassword(@Request() req) {
		return req.user;
	}

	@Post('two-factor/setup')
	async twoFactorSetup(@Request() req) {
		return req.user;
	}

	@Post('two-factor/verify')
	async twoFactorVerify(@Request() req) {
		return req.user;
	}

	@UseGuards(LocalAuthGuard)
	@Post('test')
	async testLogin(@Request() req) {
		return this.authService.generateJWT(req.user);
	}

	@Post('google/verify')
	async verifyGoogleToken(@Body() body: { credential: string }) {
		return this.authService.verifyIdToken(body.credential);
	}
}
