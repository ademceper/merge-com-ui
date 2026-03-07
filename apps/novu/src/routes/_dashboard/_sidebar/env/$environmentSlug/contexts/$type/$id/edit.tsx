import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const EditContextPage = lazy(
	() => import("@/pages/contexts/ui/edit-context"),
);

export const Route = createFileRoute(
	"/_dashboard/_sidebar/env/$environmentSlug/contexts/$type/$id/edit",
)({
	component: EditContextPage,
});
