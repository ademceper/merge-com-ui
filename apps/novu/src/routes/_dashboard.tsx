import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Suspense } from "react";
import { CommandPalette } from "@/widgets/command-palette";
import { CommandPaletteProvider } from "@/widgets/command-palette/command-palette-provider";
import { Toaster } from "@/shared/ui/primitives/sonner";
import { EnvironmentProvider } from "@/app/context/environment/environment-provider";
import { OptInProvider } from "@/app/context/opt-in-provider";

function DashboardLayout() {
	return (
		<EnvironmentProvider>
			<OptInProvider>
				<CommandPaletteProvider>
					<Suspense>
						<Outlet />
					</Suspense>
					<CommandPalette />
					<Toaster />
				</CommandPaletteProvider>
			</OptInProvider>
		</EnvironmentProvider>
	);
}

export const Route = createFileRoute("/_dashboard")({
	component: DashboardLayout,
});
