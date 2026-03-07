import type { ChannelTypeEnum } from "./channel";
import type { EnvironmentId } from "./environment";
import type { OrganizationId } from "./organization";
import type { ProvidersIdEnum } from "./providers";

type ChannelConnection = {
	_id: string;
	identifier: string;

	_organizationId: OrganizationId;
	_environmentId: EnvironmentId;

	integrationIdentifier: string;
	providerId: ProvidersIdEnum;
	channel: ChannelTypeEnum;
	subscriberId?: string;
	contextKeys: string[];

	workspace: { id: string; name?: string };
	auth: { accessToken: string };

	createdAt: string;
	updatedAt: string;
};
