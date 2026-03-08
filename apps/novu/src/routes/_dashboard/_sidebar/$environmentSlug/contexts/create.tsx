import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const CreateContextPage = lazy(
	() => import("@/pages/contexts/ui/create-context"),
);

export const Route = createFileRoute(
	"/_dashboard/_sidebar/$environmentSlug/contexts/create",
)({
	component: CreateContextPage,
});
