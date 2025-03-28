import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { useContainer } from 'class-validator';
import {
	FastifyAdapter,
	NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { GlobalResponseFilter } from './common/filters/custom-exception.filter';
import { ConfigService } from '@nestjs/config';
import { ResolvePromisesInterceptor } from './common/interceptors/serializer.interceptor';
import compression from '@fastify/compress';
import fastifyHelmet from '@fastify/helmet';
// import { Transport } from '@nestjs/microservices';
// import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
	const app = await NestFactory.create<NestFastifyApplication>(
		AppModule,
		new FastifyAdapter({
			logger: true,
			caseSensitive: true, // Optimizes request matching
			ignoreTrailingSlash: true, // Ignores trailing slashes in URLs
			trustProxy: true,
			connectionTimeout: 60000,
			maxParamLength: 100,
			keepAliveTimeout: 60000,
			// http2: true,
		}),
	);
	useContainer(app.select(AppModule), { fallbackOnErrors: true });
	const configService = app.get(ConfigService);
	const corsOrigins = configService
		.get('CORS_ORIGINS')
		.split(',')
		.map((origin) => origin.trim());

	app.enableCors({
		origin: corsOrigins,
	});
	app.enableShutdownHooks();
	app.setGlobalPrefix('api', {
		exclude: ['/'],
	});
	app.enableVersioning({
		// defaultVersion: '1',
		type: VersioningType.URI,
	});
	await app.register(compression, {
		encodings: ['gzip', 'deflate'],
		threshold: 1024, // Only compress responses larger than 1KB
	});

	await app.register(fastifyHelmet, {
		contentSecurityPolicy: {
			directives: {
				defaultSrc: [`'self'`],
				styleSrc: [`'self'`, `'unsafe-inline'`],
				imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
				scriptSrc: [`'self'`],
			},
		},
	});
	app.useGlobalPipes(new ValidationPipe());

	app.useGlobalInterceptors(
		new ResolvePromisesInterceptor(),
		new ClassSerializerInterceptor(app.get(Reflector)),
	);

	app.useGlobalFilters(new GlobalResponseFilter());

	// await configMicroservices(app, configService);
	// await app.startAllMicroservices();

	await app.listen({ port: configService.get('PORT'), host: '0.0.0.0' });
	console.log(`[x] App running with port ${configService.get('PORT')}`);
}
void bootstrap();

// async function configMicroservices(
// 	app: NestFastifyApplication,
// 	configService: ConfigService,
// ) {
// 	app.connectMicroservice({
// 		transport: Transport.RMQ,
// 		options: {
// 			urls: [`${configService.get('RABBITMQ_URL')}`],
// 			queue: 'core_queue',
// 			noAck: false,
// 			queueOptions: {
// 				durable: false,
// 			},
// 		},
// 	});
// }
