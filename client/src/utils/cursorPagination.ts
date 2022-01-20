import { Resolver } from '@urql/exchange-graphcache';

export type MergeMode = 'before' | 'after';

export interface PaginationParams {
	offsetArgument?: string;
	limitArgument?: string;
	mergeMode?: MergeMode;
}

export const cursorPagination = (): Resolver => {
	return (_parent, fieldArgs, cache, info) => {
		const { parentKey: entityKey, fieldName } = info;
		//console.log(entityKey, fieldName); // e.g: Query posts
		const allFields = cache.inspectFields(entityKey);
		const fieldInfos = allFields.filter((info) => info.fieldName === fieldName);
		const size = fieldInfos.length;
		if (size === 0) {
			return undefined;
		}
		// DEPRECATED:
		//   const fkey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
		//   const isIncache2 = cache.resolveFieldByKey(entityKey, fkey);

		const isInCache = cache.resolve(
			cache.resolve({ __typename: entityKey }, fieldName, fieldArgs) as string,
			fieldName
		);

		info.partial = !isInCache;

		const results: string[] = [];

		let hasMore = true;
		fieldInfos.forEach((fi) => {
			// const data = cache.resolveFieldByKey(entityKey, fi.fieldKey) // Deprecated!!
			const key = cache.resolve(
				{ __typename: entityKey },
				fieldName,
				fi.arguments
			) as string; // e.g : Query.posts({limit: 10})
			const data = cache.resolve(key, fieldName) as string[];
			const _hasMore = cache.resolve(key, 'hasMore') as boolean;
			if (!_hasMore) {
				hasMore = _hasMore;
			}
			//console.log(hasMore, posts); // e.g: ['Post:14', 'Post:2', ...]

			results.push(...data);
		});
		return {
      __typename: 'PaginatedPosts',
			posts: results,
			hasMore: hasMore,
		};

		// 	const visited = new Set();
		// 	let result: NullArray<string> = [];
		// 	let prevOffset: number | null = null;

		// 	for (let i = 0; i < size; i++) {
		// 		const { fieldKey, arguments: args } = fieldInfos[i];
		// 		if (args === null || !compareArgs(fieldArgs, args)) {
		// 			continue;
		// 		}

		// 		const links = cache.resolve(entityKey, fieldKey) as string[];
		// 		const currentOffset = args[offsetArgument];

		// 		if (
		// 			links === null ||
		// 			links.length === 0 ||
		// 			typeof currentOffset !== 'number'
		// 		) {
		// 			continue;
		// 		}

		// 		const tempResult: NullArray<string> = [];

		// 		for (let j = 0; j < links.length; j++) {
		// 			const link = links[j];
		// 			if (visited.has(link)) continue;
		// 			tempResult.push(link);
		// 			visited.add(link);
		// 		}

		// 		if (
		// 			(!prevOffset || currentOffset > prevOffset) ===
		// 			(mergeMode === 'after')
		// 		) {
		// 			result = [...result, ...tempResult];
		// 		} else {
		// 			result = [...tempResult, ...result];
		// 		}

		// 		prevOffset = currentOffset;
		// 	}

		// 	const hasCurrentPage = cache.resolve(entityKey, fieldName, fieldArgs);
		// 	if (hasCurrentPage) {
		// 		return result;
		// 	} else if (!(info as any).store.schema) {
		// 		return undefined;
		// 	} else {
		// 		info.partial = true;
		// 		return result;
		// 	}
	};
};
