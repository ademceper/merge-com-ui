import { Button } from "@merge-rd/ui/components/button";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AuthCard } from "@/shared/ui/auth/auth-card";
import { AnimatedPage } from "@/pages/onboarding/ui/animated-page";
import { useTelemetry } from "@/shared/lib/hooks/use-telemetry";
import { ROUTES } from "@/shared/lib/routes";
import { TelemetryEvent } from "@/shared/lib/telemetry";

export function InboxEmbedSuccessPage() {
	const navigate = useNavigate();
	const telemetry = useTelemetry();

	useEffect(() => {
		telemetry(TelemetryEvent.INBOX_EMBED_SUCCESS_PAGE_VIEWED);
	}, [telemetry]);

	function handleNavigateToDashboard() {
		navigate({ to: ROUTES.WELCOME });
	}

	return (
		<AnimatedPage className="flex flex-col items-center justify-center">
			<AuthCard className="relative mt-10 block max-h-[366px] min-h-[380px] w-full max-w-[366px] border-none bg-transparent bg-[linear-gradient(180deg,rgba(255,255,255,0.35)_0%,rgba(255,255,255,0.15)_39.37%)]">
				<div className="flex w-full flex-col justify-center p-0">
					<div className="relative mb-[50px] flex w-full flex-row items-end justify-end p-2">
						<img
							src="/images/auth/success-usecase-hint.svg"
							alt="Onboarding succcess hint to look for inbox"
						/>
					</div>

					<div className="flex flex-col items-center justify-center gap-[50px] p-5">
						<div className="flex flex-col items-center gap-4">
							<img
								src="/images/novu-logo-dark.svg"
								alt="Novu Logo"
								className="h-8"
							/>

							<div className="flex flex-col items-center gap-1.5">
								<h2 className="text-foreground-950 text-center text-lg">
									See how simple that was?
								</h2>
								<p className="text-foreground-400 text-center text-xs">
									Robust and flexible building blocks for application
									notifications.
								</p>
							</div>
						</div>
					</div>

					<div className="flex flex-col px-6">
						<Button
							className="mt-8 w-full"
							variant="primary"
							onClick={handleNavigateToDashboard}
						>
							Go to the Dashboard
						</Button>
					</div>
				</div>
			</AuthCard>
		</AnimatedPage>
	);
}
