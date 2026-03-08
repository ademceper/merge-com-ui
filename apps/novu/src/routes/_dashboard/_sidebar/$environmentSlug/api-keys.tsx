import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const ApiKeysPage = lazy(() =>
	import("@/pages/settings/ui/api-keys").then((m) => ({
		default: m.ApiKeysPage,
	})),
);

export const Route = createFileRoute(
	"/_dashboard/_sidebar/$environmentSlug/api-keys",
)({
	component: ApiKeysPage,
});
