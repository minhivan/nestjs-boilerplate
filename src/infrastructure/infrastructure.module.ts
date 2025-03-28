import { Global, Module } from '@nestjs/common';
import { ElasticModule } from './elastic/elastic.module';
import { RateLimiterService } from './rate-limiter/rate-limiter.service';
// import { RabbitMqModule } from './rabbitmq/rabbitmq.module';
// import { AblyModule } from './ably/ably.module';

@Global()
@Module({
	imports: [ElasticModule],
	providers: [RateLimiterService],
	exports: [ElasticModule, RateLimiterService],
})
export class InfrastructureModule {}
