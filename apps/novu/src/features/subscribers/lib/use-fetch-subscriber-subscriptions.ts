import { useQuery } from "@tanstack/react-query";
import { getSubscriberSubscriptions } from "@/entities/subscriber/api/subscribers";
import {
	requireEnvironment,
	useEnvironment,
} from "@/app/context/environment/hooks";
import { QueryKeys } from "@/shared/lib/query-keys";

export function useFetchSubscriberSubscriptions({
	subscriberId,
	limit = 10,
	page,
	contextKeys,
}: {
	subscriberId: string;
	limit?: number;
	page?: number;
	contextKeys?: string[];
}) {
	const { currentEnvironment } = useEnvironment();

	return useQuery({
		queryKey: [
			QueryKeys.fetchSubscriberSubscriptions,
			currentEnvironment?._id,
			subscriberId,
			limit,
			page,
			contextKeys,
		],
		queryFn: async () => {
			const environment = requireEnvironment(
				currentEnvironment,
				"Environment is required",
			);

			return await getSubscriberSubscriptions({
				environment,
				subscriberId,
				limit,
				contextKeys,
			});
		},
		enabled: !!currentEnvironment && !!subscriberId,
	});
}
