import type { ConfigConfigurationGroup } from "@novu/shared";
import type { Control } from "react-hook-form";
import { CredentialSection } from "./credential-section";
import type { IntegrationFormData } from "./types";
import { configurationToCredential } from "./utils/helpers";

type CrossChannelConfigsGroupProps = {
	integrationId?: string;
	control: Control<IntegrationFormData>;
	isReadOnly?: boolean;
	group: ConfigConfigurationGroup;
};

export function CrossChannelConfigsGroup({
	integrationId,
	control,
	isReadOnly,
	group,
}: CrossChannelConfigsGroupProps) {
	const { configurations } = group;
	return (
		<>
			{configurations.map((config) => (
				<CredentialSection
					key={`${String(config.key)}-${integrationId || "no-id"}`}
					name="configurations"
					credential={configurationToCredential(config)}
					control={control}
					isReadOnly={isReadOnly}
					integrationId={integrationId}
				/>
			))}
		</>
	);
}
