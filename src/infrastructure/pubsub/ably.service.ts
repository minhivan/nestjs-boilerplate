import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Ably from 'ably';

@Injectable()
export class AblyService implements OnModuleInit, OnModuleDestroy {
	private ablyClient: Ably.Realtime;

	constructor(private readonly configService: ConfigService) {
		this.ablyClient = new Ably.Realtime({
			key: this.configService.get<string>('ABLY_KEY'),
		});
	}

	onModuleInit() {
		console.log('AblyService initialized');
	}

	onModuleDestroy() {
		console.log('AblyService shutting down');
		this.ablyClient.close();
	}

	/**
	 * Publish a message to a specific channel
	 * @param channelName The name of the channel
	 * @param eventName The name of the event
	 * @param data The message payload
	 */
	async publish(
		channelName: string,
		eventName: string,
		data: any,
	): Promise<void> {
		const channel = this.ablyClient.channels.get(channelName);
		channel.publish(eventName, data);
	}

	/**
	 * Subscribe to events on a specific channel
	 * @param channelName The name of the channel
	 * @param eventName The name of the event
	 * @param callback The callback to execute when the event is received
	 */
	subscribe(
		channelName: string,
		eventName: string,
		callback: (data: any) => void,
	): void {
		const channel = this.ablyClient.channels.get(channelName);
		channel.subscribe(eventName, (message) => {
			console.log(
				`Received event "${eventName}" on channel "${channelName}":`,
				message.data,
			);
			callback(message.data);
		});
	}

	/**
	 * Unsubscribe from a specific event on a channel
	 * @param channelName The name of the channel
	 * @param eventName The name of the event
	 */
	unsubscribe(channelName: string, eventName: string): void {
		const channel = this.ablyClient.channels.get(channelName);
		channel.unsubscribe(eventName);
		console.log(
			`Unsubscribed from event "${eventName}" on channel "${channelName}"`,
		);
	}
}
