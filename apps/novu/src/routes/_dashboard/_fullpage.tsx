import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Suspense } from "react";

function FullPageLayout() {
	return (
		<div className="flex h-svh flex-col overflow-hidden">
			<Suspense>
				<Outlet />
			</Suspense>
		</div>
	);
}

export const Route = createFileRoute("/_dashboard/_fullpage")({
	component: FullPageLayout,
});
