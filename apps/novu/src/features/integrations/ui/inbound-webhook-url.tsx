import type { ConfigConfigurationGroup, IProviderConfig } from "@/shared";
import { AnimatePresence, motion } from "motion/react";
import { CopyButton } from "@/shared/ui/primitives/copy-button";
import { FormLabel } from "@/shared/ui/primitives/form/form";
import { InlineToast } from "@/shared/ui/primitives/inline-toast";
import { Input } from "@/shared/ui/primitives/input";
import { API_HOSTNAME } from "@/shared/config";
import { useEnvironment } from "@/app/context/environment/hooks";
import { fadeIn } from "@/shared/lib/animation";

function generateInboundWebhookUrl(
	environmentId: string,
	integrationId?: string,
): string {
	const baseUrl = API_HOSTNAME ?? "https://api.novu.co";
	return `${baseUrl}/v2/inbound-webhooks/delivery-providers/${environmentId}/${integrationId}`;
}

interface InboundWebhookUrlProps {
	integrationId?: string;
	autoConfigureState: "idle" | "loading" | "success" | "error";
	provider?: IProviderConfig;
	group: ConfigConfigurationGroup;
}

export function InboundWebhookUrl({
	integrationId,
	autoConfigureState,
	provider,
	group,
}: InboundWebhookUrlProps) {
	const { currentEnvironment } = useEnvironment();
	// biome-ignore lint/style/noNonNullAssertion: currentEnvironment is guaranteed to exist in this context
	const inboundWebhookUrl = generateInboundWebhookUrl(
		currentEnvironment?._id!,
		integrationId,
	);

	return (
		<div className="mb-4">
			<FormLabel htmlFor={"inboundWebhookUrl"} optional={false}>
				Inbound Webhook URL
			</FormLabel>
			<Input
				className="cursor-default font-mono text-neutral-500!"
				id={"inboundWebhookUrl"}
				value={inboundWebhookUrl}
				type="text"
				readOnly={true}
				trailingNode={<CopyButton valueToCopy={inboundWebhookUrl} />}
			/>

			{/* Show instructions only when auto-configure fails */}
			<AnimatePresence mode="wait">
				{autoConfigureState === "error" && (
					<motion.div key="error-instructions" {...fadeIn}>
						<InlineToast
							variant={"tip"}
							className="mt-3"
							title="Manual setup"
							description={`Copy this URL into the ${provider?.displayName} webhook settings. Note: Required scopes must be enabled.`}
							ctaLabel="View Guide"
							onCtaClick={() => {
								window.open(group?.setupWebhookUrlGuide ?? "", "_blank");
							}}
						/>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
