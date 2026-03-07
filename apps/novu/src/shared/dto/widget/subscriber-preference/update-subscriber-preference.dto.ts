import type { ChannelTypeEnum } from "@/shared/model";

export interface IUpdateSubscriberPreferenceDto {
	channel?: IChannelPreference;

	enabled?: boolean;
}

export interface IChannelPreference {
	type: ChannelTypeEnum;

	enabled: boolean;
}
