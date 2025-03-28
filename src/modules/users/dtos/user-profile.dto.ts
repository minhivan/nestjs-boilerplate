import { IsOptional, IsString } from 'class-validator';

export class UserProfileDto {
	@IsString()
	@IsOptional()
	city: string;

	@IsString()
	@IsOptional()
	currency: string;

	@IsString()
	@IsOptional()
	default_language: string;

	@IsString()
	@IsOptional()
	gender: string;

	@IsString()
	@IsOptional()
	nationality: string;

	@IsString()
	@IsOptional()
	phone_number: string;

	@IsString()
	@IsOptional()
	region: string;
}
