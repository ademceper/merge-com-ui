import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const CreateTopicPage = lazy(
	() => import("@/pages/topics/ui/create-topic"),
);

export const Route = createFileRoute(
	"/_dashboard/_sidebar/env/$environmentSlug/topics/create",
)({
	component: CreateTopicPage,
});
