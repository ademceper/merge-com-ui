import { ChannelTypeEnum } from "./channel";

export enum WorkflowCreationSourceEnum {
	TEMPLATE_STORE = "template_store",
	DASHBOARD = "dashboard",
	}

type WorkflowIntegrationStatus = {
	hasActiveIntegrations: boolean;
	hasPrimaryIntegrations?: boolean;
	channels: WorkflowChannelsIntegrationStatus;
};

type WorkflowChannelsIntegrationStatus = ActiveIntegrationsStatus &
	ActiveIntegrationStatusWithPrimary;

type ActiveIntegrationsStatus = {
	[key in ChannelTypeEnum]: {
		hasActiveIntegrations: boolean;
	};
};

type ActiveIntegrationStatusWithPrimary = {
	[ChannelTypeEnum.EMAIL]: {
		hasActiveIntegrations: boolean;
		hasPrimaryIntegrations: boolean;
	};
	[ChannelTypeEnum.SMS]: {
		hasActiveIntegrations: boolean;
		hasPrimaryIntegrations: boolean;
	};
};

export enum TriggerContextTypeEnum {
	}
