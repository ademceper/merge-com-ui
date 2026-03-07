import { useQuery } from "@tanstack/react-query";
import { type ActivityFilters, getWorkflowRunsCount } from "@/entities/activity/api/activity";
import {
	requireEnvironment,
	useEnvironment,
} from "@/app/context/environment/hooks";
import { QueryKeys } from "@/shared/lib/query-keys";

interface UseWorkflowRunsCountOptions {
	filters?: ActivityFilters;
	enabled?: boolean;
	staleTime?: number;
	refetchOnWindowFocus?: boolean;
}

export function useFetchWorkflowRunsCount({
	filters,
	enabled = true,
	staleTime = 30000,
	refetchOnWindowFocus = false,
}: UseWorkflowRunsCountOptions = {}) {
	const { currentEnvironment } = useEnvironment();

	return useQuery({
		queryKey: [
			QueryKeys.fetchWorkflowRunsCount,
			currentEnvironment?._id,
			filters,
		],
		queryFn: async ({ signal }) => {
			const environment = requireEnvironment(
				currentEnvironment,
				"No environment available",
			);

			return getWorkflowRunsCount({
				environment,
				filters,
				signal,
			});
		},
		enabled: enabled && !!currentEnvironment,
		staleTime,
		refetchOnWindowFocus,
	});
}
