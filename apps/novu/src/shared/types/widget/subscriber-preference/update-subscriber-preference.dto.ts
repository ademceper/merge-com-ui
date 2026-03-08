import type { ChannelTypeEnum } from "@/shared/model";

interface IUpdateSubscriberPreferenceDto {
    channel?: IChannelPreference;

    enabled?: boolean;
}

interface IChannelPreference {
    type: ChannelTypeEnum;

    enabled: boolean;
}
