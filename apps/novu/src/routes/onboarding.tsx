import { createFileRoute, Outlet } from "@tanstack/react-router";
import { EnvironmentProvider } from "@/app/context/environment/environment-provider";

function OnboardingLayout() {
	return (
		<EnvironmentProvider>
			<Outlet />
		</EnvironmentProvider>
	);
}

export const Route = createFileRoute("/onboarding")({
	component: OnboardingLayout,
});
