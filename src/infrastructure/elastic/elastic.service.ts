import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { SearchRequest, Sort } from '@elastic/elasticsearch/lib/api/types';
import { chunk } from 'lodash';

@Injectable()
export class ElasticService implements OnModuleInit {
	private readonly logger = new Logger(ElasticService.name);
	private readonly BULK_CHUNK_SIZE = 200;

	constructor(private readonly elasticsearchService: ElasticsearchService) {}

	async onModuleInit() {
		// const check = await this.checkHealth();
		// this.logger.log(check);
		// await this.initIndex('hotel_ratings');
		// await this.initIndex('hotel_reviews');
	}

	getInstance() {
		return this.elasticsearchService;
	}

	async checkHealth() {
		try {
			return await this.elasticsearchService.cluster.health();
		} catch (e) {
			this.logger.error(e);
			return false;
		}
	}

	/**
	 *
	 *
	 * @param {string} index
	 * @return {*}
	 * @memberof ElasticService
	 */
	async initIndex(index: string) {
		try {
			this.logger.log(`[*] Initializing index ${index}`);
			const exits = await this.elasticsearchService.indices.exists({
				index: index,
			});
			if (!exits) {
				await this.elasticsearchService.indices.create({
					index: index,
				});
				this.logger.log(`[x] Index: ${index} created`);
			} else {
				this.logger.log(`[x] Index: ${index} exists`);
			}
			return await this.elasticsearchService.count({
				index: index,
			});
		} catch (e) {
			console.error(e);
			this.logger.error(e);
		}
	}
	/**
	 *
	 *
	 * @param {SearchRequest} params
	 * @return {*}
	 * @memberof ElasticService
	 */
	async search(params: SearchRequest) {
		try {
			return await this.elasticsearchService.search(params);
		} catch (e) {
			this.logger.error(e);
			throw e;
		}
	}

	/**
	 *
	 *
	 * @param {string} index
	 * @param {string} id
	 * @return {*}
	 * @memberof ElasticService
	 */
	async getDoc(index: string, id: string) {
		try {
			return await this.elasticsearchService.get({
				index: index,
				id,
			});
		} catch (e) {
			this.logger.error(e);
			throw e;
		}
	}

	/**
	 *
	 *
	 * @param {string} index
	 * @param {*} data
	 * @return {*}
	 * @memberof ElasticService
	 */
	async create(index: string, data: any) {
		try {
			const response = await this.elasticsearchService.index({
				index: index,
				id: data.id || undefined,
				document: data,
			});
			this.logger.log(`[*] Creating data to index: ${index}`);
			this.logger.log({
				index: response._index,
				id: response._id,
				result: response.result,
			});
			return response;
		} catch (err) {
			this.logger.error(err);
		}
	}

	/**
	 *
	 *
	 * @param {string} id
	 * @param {string} index
	 * @param {*} doc
	 * @return {*}
	 * @memberof ElasticService
	 */
	async update(id: string, index: string, doc: any) {
		try {
			const response = await this.elasticsearchService.update({
				index: index,
				id,
				doc,
			});
			return response;
		} catch (err) {
			this.logger.error(err);
		}
	}

	/**
	 *
	 *
	 * @param {string} index
	 * @return {*}
	 * @memberof ElasticService
	 */
	async count(index: string) {
		try {
			return await this.elasticsearchService.count({
				index: index,
				query: { match_all: {} },
			});
		} catch (e) {
			this.logger.error(e);
		}
	}

	/**
	 *
	 *
	 * @param {string} index
	 * @param {*} data
	 * @param {boolean} [isUpdate]
	 * @memberof ElasticService
	 */
	async bulk(index: string, data: any, isUpdate?: boolean) {
		const bulkOperations = data.flatMap((doc) => {
			return [
				{ index: { _index: index, _id: doc?.id ?? null } },
				{ ...doc },
			];
		});
		// console.log(bulkOperations);
		const bulkResponse = await this.getInstance().bulk({
			index,
			refresh: true,
			operations: bulkOperations,
		});
		// console.debug(bulkResponse);
		const erroredDocuments = [];
		const erroredItems = [];
		if (bulkResponse.errors) {
			this.logger.log('ERROR');
			// The items array has the same order of the dataset we just indexed.
			// The presence of the `error` key indicates that the operation
			// that we did for the document has failed.
			bulkResponse.items.forEach((action, i) => {
				const operation = Object.keys(action)[0];
				// this.logger.log(action[operation].error);
				if (action[operation].error) {
					erroredDocuments.push({
						// If the status is 429 it means that you can retry the document,
						// otherwise it's very likely a mapping error, and you should
						// fix the document before to try it again.
						status: action[operation].status,
						error: action[operation].error,
						// operation: bulkOperations[i * 2],
						// document: bulkOperations[i * 2 + 1],
					});
					erroredItems.push(bulkOperations[i * 2 + 1]);
				}
			});
			this.logger.error(erroredDocuments);
			this.logger.error(erroredItems);
		}

		// console.debug(bulkResponse.items);
		// const count = await this.elasticsearchService.count({
		// 	index: index,
		// });
		// console.debug(count);
		this.logger.log(`[*] Bulk index: ${index}`);
		this.logger.log(
			`[-] Success: ${Number(data.length) - Number(erroredDocuments.length)}`,
		);
		this.logger.log(`[-] Error: ${Number(erroredDocuments.length)}`);
	}

	/**
	 *
	 *
	 * @param {string} index
	 * @param {string} id
	 * @return {*}
	 * @memberof ElasticService
	 */
	async retrieve_document(index: string, id: string, query?: any) {
		try {
			return await this.elasticsearchService.get({
				index,
				id,
				_source: true,
				_source_excludes: query?.exclude,
			});
		} catch (e) {
			console.log(e);
		}
	}

	async bulkIndexInChunks(data: any[], bulkIndex: string) {
		try {
			const chunks = chunk(data, this.BULK_CHUNK_SIZE);

			for (const [index, chunkData] of chunks.entries()) {
				try {
					await this.bulk(bulkIndex, chunkData);
					this.logger.log(
						`Successfully indexed chunk ${index + 1}/${chunks.length}`,
					);
				} catch (error) {
					this.logger.error(
						`Failed to index chunk ${index + 1}: ${error.message}`,
					);
				}
			}
		} catch (error) {
			this.logger.error('Error in bulk indexing:', error);
			throw error;
		}
	}
}
