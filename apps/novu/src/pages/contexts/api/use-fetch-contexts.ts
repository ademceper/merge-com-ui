import type { ListContextsResponseDto } from "@novu/api/models/components";
import { type ContextId, type ContextType, DirectionEnum } from "@/shared";
import {
	keepPreviousData,
	type UseQueryOptions,
	useQuery,
} from "@tanstack/react-query";
import { getContexts } from "@/entities/context/api/contexts";
import {
	requireEnvironment,
	useEnvironment,
} from "@/app/context/environment/hooks";
import { QueryKeys } from "@/shared/lib/query-keys";

interface UseFetchContextsParams {
	limit?: number;
	after?: string;
	before?: string;
	orderDirection?: DirectionEnum;
	orderBy?: "createdAt" | "updatedAt";
	includeCursor?: boolean;
	type?: ContextType;
	id?: ContextId;
	search?: string;
}

export function useFetchContexts(
	{
		limit = 10,
		after = "",
		before = "",
		orderDirection = DirectionEnum.DESC,
		orderBy = "createdAt",
		includeCursor,
		type = "",
		id = "",
		search = "",
	}: UseFetchContextsParams = {},
	options: Omit<
		UseQueryOptions<ListContextsResponseDto, Error>,
		"queryKey" | "queryFn"
	> = {},
) {
	const { currentEnvironment } = useEnvironment();

	const contextsQuery = useQuery({
		queryKey: [
			QueryKeys.fetchContexts,
			currentEnvironment?._id,
			{
				limit,
				after,
				before,
				orderDirection,
				orderBy,
				includeCursor,
				type,
				id,
				search,
			},
		],
		queryFn: () => {
			const environment = requireEnvironment(
				currentEnvironment,
				"No environment available",
			);

			return getContexts({
				environment,
				limit,
				after,
				before,
				orderDirection,
				orderBy,
				includeCursor,
				type,
				id,
				search,
			});
		},
		placeholderData: keepPreviousData,
		enabled: !!currentEnvironment?._id,
		refetchOnWindowFocus: true,
		...options,
	});

	return contextsQuery;
}
