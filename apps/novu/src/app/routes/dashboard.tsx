import { Outlet } from "react-router-dom";
import { CommandPalette } from "@/widgets/command-palette";
import { CommandPaletteProvider } from "@/widgets/command-palette/command-palette-provider";
import { Toaster } from "@/shared/ui/primitives/sonner";
import { EnvironmentProvider } from "@/app/context/environment/environment-provider";
import { OptInProvider } from "@/app/context/opt-in-provider";

export const DashboardRoute = () => {
	return (
		<EnvironmentProvider>
			<OptInProvider>
				<CommandPaletteProvider>
					<Outlet />
					<CommandPalette />
					<Toaster />
				</CommandPaletteProvider>
			</OptInProvider>
		</EnvironmentProvider>
	);
};
