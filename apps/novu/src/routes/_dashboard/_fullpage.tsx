import { createFileRoute, Outlet } from "@tanstack/react-router";

function FullPageLayout() {
	return (
		<div className="flex h-svh flex-col overflow-hidden">
			<Outlet />
		</div>
	);
}

export const Route = createFileRoute("/_dashboard/_fullpage")({
	component: FullPageLayout,
});
