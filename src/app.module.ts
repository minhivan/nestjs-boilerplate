import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ElasticModule } from './infrastructure/elastic/elastic.module';
import {
	CacheInterceptor,
	CacheModule,
	CacheStore,
} from '@nestjs/cache-manager';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
// import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { redisStore } from 'cache-manager-redis-yet';
import { IntegrationsModule } from './integrations/integrations.module';
import { ChannelGuard } from './modules/auth/guards/channel.guard';
import { BullModule } from '@nestjs/bull';
import { getBullConfig } from './configs/bull.config';

@Module({
	imports: [
		ConfigModule.forRoot({
			cache: true,
			isGlobal: true,
		}),
		CacheModule.registerAsync({
			isGlobal: true,
			useFactory: getBullConfig,
			inject: [ConfigService],
		}),
		BullModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: getBullConfig,
		}),
		ThrottlerModule.forRoot([
			{
				ttl: 60000,
				limit: 100,
			},
		]),
		EventEmitterModule.forRoot(),
		ScheduleModule.forRoot(),
		// PrismaModule,
		IntegrationsModule,
		ElasticModule,
		UsersModule,
		AuthModule,
	],
	controllers: [],
	providers: [
		// {
		// 	provide: APP_INTERCEPTOR,
		// 	useClass: CacheInterceptor,
		// },
		{
			provide: APP_GUARD,
			useClass: ThrottlerGuard,
		},
		{
			provide: APP_GUARD,
			useClass: ChannelGuard,
		},
		// {
		// 	provide: APP_GUARD,
		// 	useClass: AuthGuard,
		// },
	],
	exports: [],
})
export class AppModule {}
