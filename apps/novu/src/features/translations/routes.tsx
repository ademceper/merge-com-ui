import type { RouteObject } from "react-router-dom";
import { lazy } from "react";
import { ROUTES } from "@/shared/lib/routes";

const TranslationsPage = lazy(() =>
	import("@/features/translations/ui/pages/translations").then((m) => ({
		default: m.TranslationsPage,
	})),
);
const TranslationSettingsPage = lazy(() =>
	import("@/features/translations/ui/pages/translation-settings-page").then(
		(m) => ({
			default: m.TranslationSettingsPage,
		}),
	),
);
const EditTranslationPage = lazy(() =>
	import("@/features/translations/ui/pages/edit-translation").then((m) => ({
		default: m.EditTranslationPage,
	})),
);

export const translationsDashboardRoutes: RouteObject = {
	path: ROUTES.TRANSLATIONS,
	element: <TranslationsPage />,
	children: [
		{
			path: ROUTES.TRANSLATION_SETTINGS,
			element: <TranslationSettingsPage />,
		},
		{
			path: ROUTES.TRANSLATIONS_EDIT,
			element: <EditTranslationPage />,
		},
	],
};
