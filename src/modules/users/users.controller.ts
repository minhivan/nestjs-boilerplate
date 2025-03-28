import {
	Body,
	Controller,
	Get,
	Patch,
	Post,
	Put,
	Request,
	UseGuards,
} from '@nestjs/common';
// import { AuthGuard } from 'src/modules/auth/auth.guard';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { UserProfileInterface } from './interfaces/user-profile.interface';
import { UserProfileDto } from './dtos/user-profile.dto';

@Controller('users')
export class UsersController {
	constructor(private userService: UsersService) {}

	@UseGuards(AuthGuard)
	@Get('profile')
	async getProfile(@Request() req) {
		return {
			data: req.user,
		};
	}

	@UseGuards(AuthGuard)
	@Patch('update-profile')
	async updateProfileDetails(
		@Request() req,
		@Body() updateProfile: UserProfileDto,
	) {
		return this.userService.updateUserReferences(
			req.user.id,
			updateProfile,
		);
	}

	@UseGuards(AuthGuard)
	@Post('upload-avatar')
	async uploadAvatar(@Request() req) {
		return {
			data: req.user,
		};
	}

	@UseGuards(AuthGuard)
	@Get('addresses')
	async retrieveSaveAddress(@Request() req) {
		return {
			data: req.user,
		};
	}
}
