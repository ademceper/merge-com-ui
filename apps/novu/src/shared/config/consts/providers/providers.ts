import {
	type ChannelTypeEnum,
	ChatProviderIdEnum,
	EmailProviderIdEnum,
	InAppProviderIdEnum,
	type ProvidersIdEnum,
	SmsProviderIdEnum,
} from "@/shared/model";
import {
	chatProviders,
	emailProviders,
	inAppProviders,
	pushProviders,
	smsProviders,
} from "./channels";
import type { IProviderConfig } from "./provider.interface";

;

export const providers: IProviderConfig[] = [
	...emailProviders,
	...smsProviders,
	...chatProviders,
	...pushProviders,
	...inAppProviders,
];

export const NOVU_PROVIDERS: ProvidersIdEnum[] = [
	InAppProviderIdEnum.Novu,
	SmsProviderIdEnum.Novu,
	EmailProviderIdEnum.Novu,
	ChatProviderIdEnum.Novu,
];

const NOVU_SMS_EMAIL_PROVIDERS: ProvidersIdEnum[] = [
	SmsProviderIdEnum.Novu,
	EmailProviderIdEnum.Novu,
];

const PROVIDER_ID_TO_CHANNEL_MAP: Record<string, ChannelTypeEnum> =
	Object.fromEntries(providers.map((p) => [p.id, p.channel]));
