import { useOrganization } from "@merge-rd/auth";
import type { GetSubscriptionDto } from "@/shared";
import { useQuery } from "@tanstack/react-query";
import { differenceInDays, isSameDay } from "date-fns";
import { useMemo } from "react";
import { getSubscription } from "@/entities/billing/api/billing";
import { IS_ENTERPRISE, IS_SELF_HOSTED } from "@/shared/config";
import { useEnvironment } from "@/app/context/environment/hooks";
import { QueryKeys } from "@/shared/lib/query-keys";

const today = new Date();

type UseSubscriptionType = GetSubscriptionDto & {
	daysLeft: number;
	isLoading: boolean;
};

export const useFetchSubscription = () => {
	const { organization: currentOrganization } = useOrganization();
	const { currentEnvironment } = useEnvironment();

	const { data: subscription, isLoading: isLoadingSubscription } =
		useQuery<GetSubscriptionDto>({
			queryKey: [QueryKeys.billingSubscription, currentOrganization?.id],
			queryFn: () => getSubscription({ environment: currentEnvironment! }),
			enabled: !!currentOrganization && (IS_ENTERPRISE || !IS_SELF_HOSTED),
			meta: {
				showError: false,
			},
		});

	const daysLeft = useMemo(() => {
		if (!subscription?.trial.end) return 0;

		return isSameDay(new Date(subscription.trial.end), today)
			? 0
			: differenceInDays(new Date(subscription.trial.end), today);
	}, [subscription?.trial.end]);

	return {
		isLoading: isLoadingSubscription,
		subscription,
		daysLeft,
	};
};
