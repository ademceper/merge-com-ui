   import {
	SidebarInset,
	SidebarPage,
	SidebarProvider,
} from "@merge-rd/ui/components/sidebar";
import { TrayProvider } from "@merge-rd/ui/components/tray";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Suspense } from "react";
import { HeaderNavigation } from "@/widgets/header-navigation/header-navigation";
import { EnvironmentTray } from "@/widgets/environment-tray";
import { NovuAppSidebar } from "@/widgets/novu-app-sidebar";
import {
	PageHeaderProvider,
	usePageHeaderContext,
} from "@/app/context/page-header";

function SidebarLayoutContent() {
	const { startItems } = usePageHeaderContext();

	return (
		<SidebarInset>
			<HeaderNavigation startItems={startItems} />
			<SidebarPage className="px-4 pb-4">
				<Suspense>
					<Outlet />
				</Suspense>
			</SidebarPage>
		</SidebarInset>
	);
}

function SidebarLayout() {
	return (
		<PageHeaderProvider>
			<TrayProvider className="h-svh bg-sidebar overflow-hidden">
					<SidebarProvider defaultOpen={true}>
						<NovuAppSidebar />
						<SidebarLayoutContent />
					</SidebarProvider>
				<EnvironmentTray />
			</TrayProvider>
		</PageHeaderProvider>
	);
}

export const Route = createFileRoute("/_dashboard/_sidebar")({
	component: SidebarLayout,
});
