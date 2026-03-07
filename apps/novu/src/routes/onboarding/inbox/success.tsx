import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const InboxEmbedSuccessPage = lazy(
	() => import("@/pages/onboarding/ui/inbox-embed-success-page"),
);

export const Route = createFileRoute("/onboarding/inbox/success")({
	component: InboxEmbedSuccessPage,
});
