import { Global, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { DirectusModule } from './directus/directus.module';

@Global()
@Module({
	imports: [HttpModule, DirectusModule],
	providers: [],
	exports: [],
})
export class IntegrationsModule {}
