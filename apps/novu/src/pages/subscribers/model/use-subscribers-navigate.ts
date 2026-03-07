import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";

import { useEnvironment } from "@/app/context/environment/hooks";
import { QueryKeys } from "@/shared/lib/query-keys";
import { buildRoute, ROUTES } from "@/shared/lib/routes";

export const useSubscribersNavigate = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { currentEnvironment } = useEnvironment();

	const navigateToSubscribersCurrentPage = useCallback(() => {
		navigate({
			to: `${buildRoute(ROUTES.SUBSCRIBERS, { environmentSlug: currentEnvironment?.slug ?? "" })}${location.searchStr}`,
		});
	}, [location.searchStr, navigate, currentEnvironment?.slug]);

	const navigateToEditSubscriberPage = useCallback(
		(subscriberId: string) => {
			navigate({
				to: `${buildRoute(ROUTES.EDIT_SUBSCRIBER, {
					environmentSlug: currentEnvironment?.slug ?? "",
					subscriberId: encodeURIComponent(subscriberId),
				})}${location.searchStr}`,
			});
		},
		[location.searchStr, navigate, currentEnvironment?.slug],
	);

	const navigateToCreateSubscriberPage = useCallback(() => {
		navigate({
			to: `${buildRoute(ROUTES.CREATE_SUBSCRIBER, { environmentSlug: currentEnvironment?.slug || "" })}${location.searchStr}`,
		});
	}, [location.searchStr, navigate, currentEnvironment?.slug]);

	const navigateToSubscribersFirstPage = useCallback(() => {
		const newParams = new URLSearchParams(location.searchStr);
		const hasAfter = newParams.has("after");
		const hasBefore = newParams.has("before");
		const hasIncludeCursor = newParams.has("includeCursor");

		if (hasAfter || hasBefore || hasIncludeCursor) {
			newParams.delete("after");
			newParams.delete("before");
			newParams.delete("includeCursor");

			// reset the query to trigger a subscribers table loading state
			queryClient.resetQueries({
				queryKey: [QueryKeys.fetchSubscribers],
			});
		}

		navigate({
			to: `${buildRoute(ROUTES.SUBSCRIBERS, { environmentSlug: currentEnvironment?.slug ?? "" })}?${newParams}`,
			replace: true,
		});
	}, [queryClient, location.searchStr, navigate, currentEnvironment?.slug]);

	return {
		navigateToSubscribersCurrentPage,
		navigateToEditSubscriberPage,
		navigateToCreateSubscriberPage,
		navigateToSubscribersFirstPage,
	};
};
