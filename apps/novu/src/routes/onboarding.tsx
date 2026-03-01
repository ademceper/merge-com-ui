import { AnimatedOutlet } from '@/components/animated-outlet';
import { EnvironmentProvider } from '../context/environment/environment-provider';

export const OnboardingParentRoute = () => {
  return (
    <EnvironmentProvider>
      <AnimatedOutlet />
    </EnvironmentProvider>
  );
};
