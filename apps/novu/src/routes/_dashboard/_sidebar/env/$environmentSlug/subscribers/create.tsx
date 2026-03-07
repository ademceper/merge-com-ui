import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const CreateSubscriberPage = lazy(
	() => import("@/pages/subscribers/ui/create-subscriber"),
);

export const Route = createFileRoute(
	"/_dashboard/_sidebar/env/$environmentSlug/subscribers/create",
)({
	component: CreateSubscriberPage,
});
