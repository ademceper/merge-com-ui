import { useLocation, useNavigate } from "react-router-dom";
import { useEnvironment } from "@/app/context/environment/hooks";
import { buildRoute, ROUTES } from "@/shared/lib/routes";

export const useLayoutsNavigate = () => {
	const navigate = useNavigate();
	const { search } = useLocation();
	const { currentEnvironment } = useEnvironment();

	const navigateToLayoutsPage = () => {
		if (!currentEnvironment?.slug) return;

		navigate(
			`${buildRoute(ROUTES.LAYOUTS, { environmentSlug: currentEnvironment.slug })}${search}`,
		);
	};

	const navigateToLayoutEditorPage = (layoutSlug: string) => {
		if (!currentEnvironment?.slug) return;

		navigate(
			`${buildRoute(ROUTES.LAYOUTS_EDIT, { environmentSlug: currentEnvironment.slug, layoutSlug })}${search}`,
		);
	};

	return {
		navigateToLayoutsPage,
		navigateToLayoutEditorPage,
	};
};
