import { createFileRoute, Navigate, useLocation } from "@tanstack/react-router";
import { SpinnerGap } from "@phosphor-icons/react";
import { buildRoute, ROUTES } from "@/shared/lib/routes";
import { useEnvironment } from "@/app/context/environment/hooks";

function CatchAllComponent() {
	const { currentEnvironment, areEnvironmentsInitialLoading } =
		useEnvironment();
	const location = useLocation();
	const path = location.pathname.substring(1);

	if (areEnvironmentsInitialLoading) {
		return (
			<div className="flex h-screen items-center justify-center">
				<div className="flex flex-col items-center gap-3">
					<SpinnerGap className="text-primary-base size-8 animate-spin" />
					<div className="text-text-sub text-label-sm">
						Loading environment...
					</div>
				</div>
			</div>
		);
	}

	if (!currentEnvironment?.slug) {
		return <Navigate to="/" />;
	}

	const routeEntries = Object.entries(ROUTES);

	for (const [, routePath] of routeEntries) {
		if (
			typeof routePath === "string" &&
			routePath.includes("$environmentSlug") &&
			routePath.startsWith("/$environmentSlug/") &&
			!routePath.includes("/", "/$environmentSlug/".length)
		) {
			const routeName = routePath.replace("/$environmentSlug/", "");

			if (path === routeName) {
				const targetPath = buildRoute(routePath, {
					environmentSlug: currentEnvironment.slug,
				});
				return (
					<Navigate to={`${targetPath}${location.search}${location.hash}`} />
				);
			}
		}
	}

	return (
		<Navigate
			to={
				currentEnvironment?.slug
					? buildRoute(ROUTES.WORKFLOWS, {
							environmentSlug: currentEnvironment.slug,
						})
					: ROUTES.ENV
			}
		/>
	);
}

export const Route = createFileRoute("/_dashboard/_sidebar/")({
	component: CatchAllComponent,
});
