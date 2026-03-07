import {
	SidebarInset,
	SidebarPage,
	SidebarProvider,
} from "@merge-rd/ui/components/sidebar";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { HeaderNavigation } from "@/widgets/header-navigation/header-navigation";
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
				<Outlet />
			</SidebarPage>
		</SidebarInset>
	);
}

function SidebarLayout() {
	return (
		<PageHeaderProvider>
			<SidebarProvider
				defaultOpen={true}
				className="h-svh bg-sidebar overflow-hidden"
				data-scale-wrapper
			>
				<NovuAppSidebar />
				<SidebarLayoutContent />
			</SidebarProvider>
		</PageHeaderProvider>
	);
}

export const Route = createFileRoute("/_dashboard/_sidebar")({
	component: SidebarLayout,
});
