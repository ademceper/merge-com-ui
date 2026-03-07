import { Button } from "@merge-rd/ui/components/button";
import { BookBookmark, Sparkle } from "@phosphor-icons/react";
import { Link, useNavigate } from "@tanstack/react-router";
import { LinkButton } from "@/shared/ui/primitives/button-link";
import { IS_SELF_HOSTED, SELF_HOSTED_UPGRADE_REDIRECT_URL } from "@/shared/config";
import { useTelemetry } from "@/shared/lib/hooks/use-telemetry";
import { ROUTES } from "@/shared/lib/routes";
import { TelemetryEvent } from "@/shared/lib/telemetry";
import { openInNewTab } from "@/shared/lib/url";
import { EmptyTranslationsIllustration } from "./empty-translations-illustration";

export const TranslationListUpgradeCta = () => {
	const track = useTelemetry();
	const navigate = useNavigate();

	return (
		<div className="flex h-full w-full flex-col items-center justify-center gap-6">
			<EmptyTranslationsIllustration />

			<div className="flex flex-col items-center gap-2 text-center">
				<span className="text-text-sub text-label-md block font-medium">
					One language is good. Speaking your users’ language? Better.
				</span>
				<p className="text-text-soft text-paragraph-sm max-w-[60ch]">
					Unlock multi-language support and deliver personalized experiences in
					your users' preferred language.
				</p>
			</div>

			<div className="flex flex-col items-center gap-1">
				<Button
					variant="primary"
					mode="gradient"
					size="xs"
					className="mb-3.5"
					onClick={() => {
						track(TelemetryEvent.UPGRADE_TO_TEAM_TIER_CLICK, {
							source: "environments-page",
						});

						if (IS_SELF_HOSTED) {
							openInNewTab(
								`${SELF_HOSTED_UPGRADE_REDIRECT_URL}?utm_campaign=translations`,
							);
						} else {
							navigate({ to: ROUTES.SETTINGS_BILLING });
						}
					}}
					leadingIcon={Sparkle}
				>
					{IS_SELF_HOSTED ? "Contact Sales" : "Upgrade now"}
				</Button>
				<Link
					to={
						"https://docs.novu.co/platform/workflow/advanced-features/translations"
					}
					target="_blank"
				>
					<LinkButton size="sm" leadingIcon={BookBookmark}>
						How does this help?
					</LinkButton>
				</Link>
			</div>
		</div>
	);
};
