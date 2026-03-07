import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const EditTranslationPage = lazy(
	() => import("@/pages/translations/ui/edit-translation"),
);

export const Route = createFileRoute(
	"/_dashboard/_sidebar/env/$environmentSlug/translations/$resourceType/$resourceId/$locale",
)({
	component: EditTranslationPage,
});
