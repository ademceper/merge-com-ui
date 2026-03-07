import {
	type ConfigConfigurationGroup,
	FeatureFlagsKeysEnum,
	type IIntegration,
	type IProviderConfig,
} from "@novu/shared";
import type { Control } from "react-hook-form";
import { useFeatureFlag } from "@/hooks/use-feature-flag";
import { CrossChannelConfigsGroup } from "./cross-channel-configs-group";
import { InboundWebhookGroup } from "./inbound-webhook-group";
import type { IntegrationFormData } from "./types";

export function ConfigurationGroup({
	integrationId,
	group,
	control,
	isReadOnly,
	provider,
	formData,
	onAutoConfigureSuccess,
}: {
	integrationId?: string;
	group: ConfigConfigurationGroup;
	control: Control<IntegrationFormData>;
	isReadOnly?: boolean;
	provider?: IProviderConfig;
	formData?: IntegrationFormData;
	onAutoConfigureSuccess?: (integration: IIntegration) => void;
}) {
	const { groupType } = group;
	const isPushUnreadCountEnabled = useFeatureFlag(
		FeatureFlagsKeysEnum.IS_PUSH_UNREAD_COUNT_ENABLED,
		false,
	);

	if (groupType === "inboundWebhook") {
		return (
			<InboundWebhookGroup
				integrationId={integrationId}
				control={control}
				isReadOnly={isReadOnly}
				provider={provider}
				group={group}
				formData={formData}
				onAutoConfigureSuccess={onAutoConfigureSuccess}
			/>
		);
	}

	if (groupType === "crossChannelConfigs" && isPushUnreadCountEnabled) {
		return (
			<CrossChannelConfigsGroup
				integrationId={integrationId}
				control={control}
				isReadOnly={isReadOnly}
				group={group}
			/>
		);
	}

	return null;
}
