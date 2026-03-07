import { AnimatePresence } from "motion/react";
import { useEffect } from "react";
import { Outlet, useMatchRoute } from "@tanstack/react-router";
import { PageMeta } from "@/shared/ui/page-meta";
import { ProtectedDrawer } from "@/shared/ui/protected-drawer";
import { useSetPageHeader } from "@/app/context/page-header";
import { SubscriberList } from "@/pages/subscribers/ui/subscriber-list";
import { useSubscribersNavigate } from "@/pages/subscribers/model/use-subscribers-navigate";
import { useTelemetry } from "@/shared/lib/hooks/use-telemetry";
import { ROUTES } from "@/shared/lib/routes";
import { TelemetryEvent } from "@/shared/lib/telemetry";

export const SubscribersPage = () => {
	useSetPageHeader(
		<h1 className="text-foreground-950 flex items-center gap-1">
			Subscribers
		</h1>,
	);
	const track = useTelemetry();
	const matchRoute = useMatchRoute();
	const isEditMatches = !!matchRoute({ to: ROUTES.EDIT_SUBSCRIBER, fuzzy: true });
	const isCreateMatches = !!matchRoute({ to: ROUTES.CREATE_SUBSCRIBER, fuzzy: true });
	const { navigateToSubscribersCurrentPage } = useSubscribersNavigate();

	useEffect(() => {
		track(TelemetryEvent.SUBSCRIBERS_PAGE_VISIT);
	}, [track]);

	return (
		<>
			<PageMeta title="Subscribers" />
			<SubscriberList />
			<AnimatePresence mode="wait" initial>
				<ProtectedDrawer
					open={isEditMatches || isCreateMatches}
					onOpenChange={() => {
						navigateToSubscribersCurrentPage();
					}}
				>
					<Outlet />
				</ProtectedDrawer>
			</AnimatePresence>
		</>
	);
};
