import {
	SidebarInset,
	SidebarPage,
	SidebarProvider,
} from "@merge-rd/ui/components/sidebar";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Suspense, useCallback, useState } from "react";
import { HeaderNavigation } from "@/widgets/header-navigation/header-navigation";
import { EnvironmentDrawer } from "@/widgets/environment-drawer";
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
	const [envDrawerOpen, setEnvDrawerOpen] = useState(false);
	const handleEnvDrawerChange = useCallback((open: boolean) => {
		setEnvDrawerOpen(open);
		const wrapper = document.querySelector("[data-scale-wrapper]");
		if (wrapper) {
			wrapper.setAttribute("data-scaled", open ? "true" : "false");
		}
	}, []);

	return (
		<PageHeaderProvider>
			<SidebarProvider
				defaultOpen={true}
				className="h-svh bg-sidebar overflow-hidden"
				data-scale-wrapper
			>
				<NovuAppSidebar onEnvDrawerChange={handleEnvDrawerChange} />
				<SidebarLayoutContent />
			</SidebarProvider>
			<EnvironmentDrawer open={envDrawerOpen} onOpenChange={handleEnvDrawerChange} />
		</PageHeaderProvider>
	);
}

export const Route = createFileRoute("/_dashboard/_sidebar")({
	component: SidebarLayout,
});
