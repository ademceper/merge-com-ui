import type { RouteObject } from "react-router-dom";
import { lazy } from "react";
import { ROUTES } from "@/utils/routes";

const TranslationsPage = lazy(() =>
	import("@/features/translations/pages/translations").then((m) => ({
		default: m.TranslationsPage,
	})),
);
const TranslationSettingsPage = lazy(() =>
	import("@/features/translations/pages/translation-settings-page").then(
		(m) => ({
			default: m.TranslationSettingsPage,
		}),
	),
);
const EditTranslationPage = lazy(() =>
	import("@/features/translations/pages/edit-translation").then((m) => ({
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
