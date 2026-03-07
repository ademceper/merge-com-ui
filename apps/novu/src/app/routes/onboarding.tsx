import { AnimatedOutlet } from "@/shared/ui/animated-outlet";
import { EnvironmentProvider } from "../context/environment/environment-provider";

export const OnboardingParentRoute = () => {
	return (
		<EnvironmentProvider>
			<AnimatedOutlet />
		</EnvironmentProvider>
	);
};
