import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SchedulerRegistry } from '@nestjs/schedule';

@Injectable()
export class UsersListener {
	private logger = new Logger(UsersListener.name);
	constructor(private schedulerRegistry: SchedulerRegistry) {}

	@OnEvent('user.created')
	handleUserCreated(userData: Record<string, any>) {
		console.log('[*] Receive user create event ');
	}
}
