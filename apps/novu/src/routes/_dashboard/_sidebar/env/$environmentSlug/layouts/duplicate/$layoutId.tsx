import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const DuplicateLayoutPage = lazy(
	() => import("@/pages/layouts/ui/duplicate-layout-page"),
);

export const Route = createFileRoute(
	"/_dashboard/_sidebar/env/$environmentSlug/layouts/duplicate/$layoutId",
)({
	component: DuplicateLayoutPage,
});
