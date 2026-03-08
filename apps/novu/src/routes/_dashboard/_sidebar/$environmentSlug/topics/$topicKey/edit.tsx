import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const EditTopicPage = lazy(
	() => import("@/pages/topics/ui/edit-topic"),
);

export const Route = createFileRoute(
	"/_dashboard/_sidebar/$environmentSlug/topics/$topicKey/edit",
)({
	component: EditTopicPage,
});
