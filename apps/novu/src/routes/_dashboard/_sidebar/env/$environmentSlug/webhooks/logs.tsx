import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const WebhooksPage = lazy(() =>
	import("@/pages/webhooks/ui/webhooks-page").then((m) => ({
		default: m.WebhooksPage,
	})),
);

export const Route = createFileRoute(
	"/_dashboard/_sidebar/env/$environmentSlug/webhooks/logs",
)({
	component: WebhooksPage,
});
