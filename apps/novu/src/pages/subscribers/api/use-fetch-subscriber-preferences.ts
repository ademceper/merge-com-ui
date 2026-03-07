import { useOrganization } from "@merge-rd/auth";
import { type UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getSubscriberPreferences } from "@/entities/subscriber/api/subscribers";
import { useEnvironment } from "@/app/context/environment/hooks";
import { QueryKeys } from "@/shared/lib/query-keys";

type GetSubscriberPreferencesResponse = Awaited<
	ReturnType<typeof getSubscriberPreferences>
>;

type Props = {
	subscriberId: string;
	contextKeys?: string[];
	options?: Omit<
		UseQueryOptions<GetSubscriberPreferencesResponse, Error>,
		"queryKey" | "queryFn"
	>;
};

export default function useFetchSubscriberPreferences({
	subscriberId,
	contextKeys,
	options = {},
}: Props) {
	const { organization: currentOrganization } = useOrganization();
	const { currentEnvironment } = useEnvironment();

	const subscriberQuery = useQuery<GetSubscriberPreferencesResponse>({
		queryKey: [
			QueryKeys.fetchSubscriberPreferences,
			currentOrganization?.id,
			currentEnvironment?._id,
			subscriberId,
			contextKeys,
		],
		queryFn: () =>
			getSubscriberPreferences({
				environment: currentEnvironment!,
				subscriberId,
				contextKeys,
			}),
		enabled: !!currentOrganization,
		...options,
	});

	return subscriberQuery;
}
