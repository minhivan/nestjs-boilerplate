import { ApiProperty } from '@nestjs/swagger';
import {
	IsEmail,
	// IsNotEmpty,
	IsOptional,
	IsString,
	MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { lowerCaseTransformer } from 'src/common/transfomers/lowercase.transformer';

export class AuthRegisterLoginDto {
	@ApiProperty({ example: 'test1@example.com', type: String })
	@Transform(lowerCaseTransformer)
	@IsEmail()
	email: string;

	@ApiProperty()
	@MinLength(6)
	password: string;

	@ApiProperty({ example: 'John' })
	// @IsNotEmpty()
	@IsString()
	@IsOptional()
	firstName: string;

	@ApiProperty({ example: 'Doe' })
	@IsString()
	@IsOptional()
	lastName: string;
}
