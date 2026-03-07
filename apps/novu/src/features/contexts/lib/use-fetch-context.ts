import type { GetContextResponseDto } from "@novu/api/models/components";
import type { ContextId, ContextType } from "@/shared";
import { type UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getContext } from "@/entities/context/api/contexts";
import {
	requireEnvironment,
	useEnvironment,
} from "@/app/context/environment/hooks";
import { QueryKeys } from "@/shared/lib/query-keys";

interface UseFetchContextParams {
	type: ContextType;
	id: ContextId;
}

export function useFetchContext(
	{ type, id }: UseFetchContextParams,
	options: Omit<
		UseQueryOptions<GetContextResponseDto, Error>,
		"queryKey" | "queryFn"
	> = {},
) {
	const { currentEnvironment } = useEnvironment();

	const contextQuery = useQuery({
		queryKey: [QueryKeys.fetchContext, currentEnvironment?._id, type, id],
		queryFn: () => {
			const environment = requireEnvironment(
				currentEnvironment,
				"No environment available",
			);

			return getContext({
				environment,
				type,
				id,
			});
		},
		enabled: !!currentEnvironment?._id && !!type && !!id,
		...options,
	});

	return contextQuery;
}
