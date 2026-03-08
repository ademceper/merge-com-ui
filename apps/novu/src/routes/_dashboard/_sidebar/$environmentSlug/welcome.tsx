import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const WelcomePage = lazy(
	() => import("@/pages/onboarding/ui/welcome-page"),
);

export const Route = createFileRoute(
	"/_dashboard/_sidebar/$environmentSlug/welcome",
)({
	component: WelcomePage,
});
