import { Outlet } from "react-router-dom";
import { AiDrawerProvider } from "@/widgets/ai-drawer";
import { CommandPalette } from "@/widgets/command-palette";
import { CommandPaletteProvider } from "@/widgets/command-palette/command-palette-provider";
import { Toaster } from "@/shared/ui/primitives/sonner";
import { EnvironmentProvider } from "@/app/context/environment/environment-provider";
import { OptInProvider } from "@/app/context/opt-in-provider";

export const DashboardRoute = () => {
	return (
		<EnvironmentProvider>
			<OptInProvider>
				<AiDrawerProvider>
					<CommandPaletteProvider>
						<Outlet />
						<CommandPalette />
						<Toaster />
					</CommandPaletteProvider>
				</AiDrawerProvider>
			</OptInProvider>
		</EnvironmentProvider>
	);
};
