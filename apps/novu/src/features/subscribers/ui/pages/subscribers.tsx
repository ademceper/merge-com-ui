import { AnimatePresence } from "motion/react";
import { useEffect } from "react";
import { useMatch, useOutlet } from "react-router-dom";
import { PageMeta } from "@/shared/ui/page-meta";
import { ProtectedDrawer } from "@/shared/ui/protected-drawer";
import { useSetPageHeader } from "@/app/context/page-header";
import { SubscriberList } from "@/features/subscribers/ui/subscriber-list";
import { useSubscribersNavigate } from "@/features/subscribers/lib/use-subscribers-navigate";
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
	const element = useOutlet();
	const isEditMatches = useMatch(ROUTES.EDIT_SUBSCRIBER) !== null;
	const isCreateMatches = useMatch(ROUTES.CREATE_SUBSCRIBER) !== null;
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
					{element}
				</ProtectedDrawer>
			</AnimatePresence>
		</>
	);
};
