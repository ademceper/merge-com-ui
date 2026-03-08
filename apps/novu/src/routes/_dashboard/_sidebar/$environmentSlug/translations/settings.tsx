import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const TranslationSettingsPage = lazy(
	() => import("@/pages/translations/ui/translation-settings-page"),
);

export const Route = createFileRoute(
	"/_dashboard/_sidebar/$environmentSlug/translations/settings",
)({
	component: TranslationSettingsPage,
});
