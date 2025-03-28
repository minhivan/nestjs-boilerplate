import { Global, Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ElasticService } from './elastic.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
	imports: [
		ElasticsearchModule.registerAsync({
			imports: [ConfigModule],
			useFactory: async (configService: ConfigService) => {
				return {
					node: configService.get('ELASTIC_NODE'),
					auth: {
						username: configService.get('ELASTIC_USERNAME'),
						password: configService.get('ELASTIC_PASSWORD'),
					},
					tls: {
						// might be required if it's a self-signed certificate
						rejectUnauthorized: true,
						pfx: [],
					},
				};
			},
			inject: [ConfigService],
		}),
	],
	exports: [ElasticsearchModule, ElasticService],
	providers: [ElasticService],
})
export class ElasticModule {}
