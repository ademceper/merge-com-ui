import type { ContextId, ContextType } from "@/shared";
import { useCallback } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useEnvironment } from "@/app/context/environment/hooks";
import { buildRoute, ROUTES } from "@/shared/lib/routes";

export const useContextsNavigate = () => {
	const { currentEnvironment } = useEnvironment();
	const navigate = useNavigate();
	const search = useSearch({ strict: false });
	const environmentSlug = currentEnvironment?.slug ?? "";

	const navigateToCreateContextPage = useCallback(() => {
		navigate({ to: buildRoute(ROUTES.CONTEXTS_CREATE, { environmentSlug }) });
	}, [navigate, environmentSlug]);

	const navigateToEditContextPage = useCallback(
		(type: ContextType, id: ContextId) => {
			navigate({ to: buildRoute(ROUTES.CONTEXTS_EDIT, { environmentSlug, type, id }) });
		},
		[navigate, environmentSlug],
	);

	const navigateToContextsPage = useCallback(() => {
		navigate({
			to: buildRoute(ROUTES.CONTEXTS, { environmentSlug }),
			search: search as Record<string, unknown>,
		});
	}, [navigate, search, environmentSlug]);

	return {
		navigateToCreateContextPage,
		navigateToEditContextPage,
		navigateToContextsPage,
	};
};
