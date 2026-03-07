import { useCallback } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useEnvironment } from "@/app/context/environment/hooks";
import { buildRoute, ROUTES } from "@/shared/lib/routes";

export const useTopicsNavigate = () => {
	const { currentEnvironment } = useEnvironment();
	const navigate = useNavigate();
	const search = useSearch({ strict: false });
	const environmentSlug = currentEnvironment?.slug ?? "";

	const navigateToCreateTopicPage = useCallback(() => {
		navigate({ to: buildRoute(ROUTES.TOPICS_CREATE, { environmentSlug }) });
	}, [navigate, environmentSlug]);

	const navigateToEditTopicPage = useCallback(
		(topicKey: string) => {
			navigate({
				to: buildRoute(ROUTES.TOPICS_EDIT, { topicKey, environmentSlug }),
				search: search as Record<string, unknown>,
			});
		},
		[navigate, search, environmentSlug],
	);

	const navigateToTopicsPage = useCallback(() => {
		navigate({
			to: buildRoute(ROUTES.TOPICS, { environmentSlug }),
			search: search as Record<string, unknown>,
		});
	}, [navigate, search, environmentSlug]);

	return {
		navigateToCreateTopicPage,
		navigateToEditTopicPage,
		navigateToTopicsPage,
	};
};
