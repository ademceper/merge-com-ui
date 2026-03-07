import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const InboxEmbedPage = lazy(
	() => import("@/pages/onboarding/ui/inbox-embed-page"),
);

export const Route = createFileRoute("/onboarding/inbox/embed")({
	component: InboxEmbedPage,
});
