import { useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEnvironment } from "@/app/context/environment/hooks";
import { buildRoute, ROUTES } from "@/shared/lib/routes";

export const useTopicsNavigate = () => {
	const { currentEnvironment } = useEnvironment();
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const environmentSlug = currentEnvironment?.slug ?? "";

	const navigateToCreateTopicPage = useCallback(() => {
		navigate(buildRoute(ROUTES.TOPICS_CREATE, { environmentSlug }));
	}, [navigate, environmentSlug]);

	const navigateToEditTopicPage = useCallback(
		(topicKey: string) => {
			const currentSearchParams = searchParams.toString();

			navigate(
				buildRoute(ROUTES.TOPICS_EDIT, { topicKey, environmentSlug }) +
					"?" +
					currentSearchParams,
			);
		},
		[navigate, searchParams, environmentSlug],
	);

	const navigateToTopicsPage = useCallback(() => {
		const currentSearchParams = searchParams.toString();

		navigate(
			buildRoute(ROUTES.TOPICS, { environmentSlug }) +
				"?" +
				currentSearchParams,
		);
	}, [navigate, searchParams, environmentSlug]);

	return {
		navigateToCreateTopicPage,
		navigateToEditTopicPage,
		navigateToTopicsPage,
	};
};
