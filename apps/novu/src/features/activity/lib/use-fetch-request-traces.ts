import { type UseQueryOptions, useQuery } from "@tanstack/react-query";
import { type GetRequestTracesParams, getRequestTraces } from "@/entities/log/api/logs";
import { useEnvironment } from "@/app/context/environment/hooks";
import type { RequestTraces } from "@/shared/model/logs";

interface UseFetchRequestTracesParams
	extends Omit<GetRequestTracesParams, "environment"> {
	enabled?: boolean;
}

export function useFetchRequestTraces(
	params: UseFetchRequestTracesParams,
	options: Omit<UseQueryOptions<RequestTraces>, "queryKey" | "queryFn"> = {},
) {
	const { currentEnvironment } = useEnvironment();

	return useQuery<RequestTraces>({
		queryKey: ["requestTraces", currentEnvironment?.slug, params.requestId],
		queryFn: () =>
			getRequestTraces({
				environment: currentEnvironment!,
				...params,
			}),
		enabled:
			!!currentEnvironment && !!params.requestId && params.enabled !== false,
		...options,
	});
}
