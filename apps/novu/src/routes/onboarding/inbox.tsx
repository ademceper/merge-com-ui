import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const InboxUsecasePage = lazy(
	() => import("@/pages/onboarding/ui/inbox-usecase-page"),
);

export const Route = createFileRoute("/onboarding/inbox")({
	component: InboxUsecasePage,
});
