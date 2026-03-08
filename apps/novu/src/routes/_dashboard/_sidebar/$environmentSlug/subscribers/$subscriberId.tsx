import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const EditSubscriberPage = lazy(
	() => import("@/pages/subscribers/ui/edit-subscriber-page"),
);

export const Route = createFileRoute(
	"/_dashboard/_sidebar/$environmentSlug/subscribers/$subscriberId",
)({
	component: EditSubscriberPage,
});
