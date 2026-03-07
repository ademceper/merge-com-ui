import { Outlet } from "react-router-dom";

export function FullPageLayoutRoute() {
	return (
		<div className="flex h-svh flex-col overflow-hidden">
			<Outlet />
		</div>
	);
}
