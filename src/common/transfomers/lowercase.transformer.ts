import { TransformFnParams } from 'class-transformer/types/interfaces';

export type MaybeType<T> = T | undefined;

export const lowerCaseTransformer = (
	params: TransformFnParams,
): MaybeType<string> => params.value?.toLowerCase().trim();
