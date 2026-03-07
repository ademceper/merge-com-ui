import { ChannelTypeEnum } from "@/shared";
import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { AuthCard } from "@/shared/ui/auth/auth-card";
import { UsecasePlaygroundHeader } from "@/widgets/usecase-playground-header";
import { useEnvironment } from "@/app/context/environment/hooks";
import { useFetchIntegrations } from "@/features/integrations/lib/use-fetch-integrations";
import { AnimatedPage } from "@/features/onboarding/ui/animated-page";
import { InboxEmbed } from "@/features/onboarding/ui/welcome/inbox-embed";
import { useTelemetry } from "@/shared/lib/hooks/use-telemetry";
import { ROUTES } from "@/shared/lib/routes";
import { TelemetryEvent } from "@/shared/lib/telemetry";

export function InboxEmbedPage() {
	const telemetry = useTelemetry();
	const { environments } = useEnvironment();
	const [searchParams] = useSearchParams();
	const environmentHint = searchParams.get("environmentId");

	const selectedEnvironment = useMemo(
		() =>
			environments?.find((env) =>
				environmentHint ? env._id === environmentHint : !env._parentId,
			),
		[environments, environmentHint],
	);

	const { integrations } = useFetchIntegrations({
		refetchInterval: 1000,
		refetchOnWindowFocus: false,
	});

	const currentIntegrations = integrations;

	const inAppIntegration = useMemo(
		() =>
			currentIntegrations?.find(
				(integration) =>
					integration._environmentId === selectedEnvironment?._id &&
					integration.channel === ChannelTypeEnum.IN_APP,
			),
		[currentIntegrations, selectedEnvironment?._id],
	);

	const isConnected = inAppIntegration?.connected;

	useEffect(() => {
		telemetry(TelemetryEvent.INBOX_EMBED_PAGE_VIEWED);
	}, [telemetry]);

	return (
		<AnimatedPage>
			<AuthCard className="mt-10 w-full max-w-[1230px]">
				<div className="w-full">
					<div className="flex flex-1 flex-col overflow-hidden">
						<UsecasePlaygroundHeader
							title={
								isConnected
									? "Confirm Your Integration"
									: "Minutes to a fully functional <Inbox/>"
							}
							description={
								isConnected
									? "Send a test notification to verify your connection."
									: "Let's connect your inbox to Novu"
							}
							skipPath={ROUTES.WELCOME}
							onSkip={() =>
								telemetry(TelemetryEvent.SKIP_ONBOARDING_CLICKED, {
									skippedFrom: isConnected
										? "inbox-connected-guide"
										: "inbox-embed",
								})
							}
							currentStep={isConnected ? 4 : 3}
							totalSteps={4}
							showSkipButton={true}
						/>
					</div>
					<InboxEmbed />
				</div>
			</AuthCard>
		</AnimatedPage>
	);
}
