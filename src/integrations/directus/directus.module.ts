import { Global, Module } from '@nestjs/common';
import { DirectusService } from './directus.service';

@Global()
@Module({
	providers: [DirectusService],
	controllers: [],
	exports: [DirectusService],
})
export class DirectusModule {}
