import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const ChannelPreferences = lazy(() =>
	import("@/pages/workflows/ui/workflow-editor/channel-preferences").then(
		(m) => ({ default: m.ChannelPreferences }),
	),
);

export const Route = createFileRoute(
	"/_dashboard/_fullpage/$environmentSlug/workflows/$workflowSlug/preferences",
)({
	component: ChannelPreferences,
});
