import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const CreateLayoutPage = lazy(
	() => import("@/pages/layouts/ui/create-layout"),
);

export const Route = createFileRoute(
	"/_dashboard/_sidebar/env/$environmentSlug/layouts/create",
)({
	component: CreateLayoutPage,
});
