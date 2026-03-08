import { createFileRoute, Outlet } from "@tanstack/react-router";
import { lazy } from "react";

const TranslationsPage = lazy(() =>
	import("@/pages/translations/ui/translations").then((m) => ({
		default: m.TranslationsPage,
	})),
);

function TranslationsLayout() {
	return (
		<>
			<TranslationsPage />
			<Outlet />
		</>
	);
}

export const Route = createFileRoute(
	"/_dashboard/_sidebar/$environmentSlug/translations",
)({
	component: TranslationsLayout,
});
