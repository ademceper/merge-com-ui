import type { SeverityLevelEnum } from "../../config/consts";
import type {
    ISubscribersDefine,
    ITenantDefine,
    ITopic,
    ProvidersIdEnum
} from "../../model";

type TriggerRecipientSubscriber = string | ISubscribersDefine;

type TriggerRecipient = TriggerRecipientSubscriber | ITopic;

type TriggerRecipients = TriggerRecipient[];

type TriggerRecipientsPayload = TriggerRecipientSubscriber | TriggerRecipients;

type TriggerTenantContext = string | ITenantDefine;

type TriggerOverrides = {
    providers?: Record<ProvidersIdEnum, Record<string, unknown>>;
    steps?: Record<
        string,
        {
            providers?: Record<ProvidersIdEnum, Record<string, unknown>>;
            layoutId?: string | null;
        }
    >;
    channels?: {
        email?: {
            layoutId?: string | null;
        };
    };
    email?: Record<string, unknown> & {
        toRecipient?: string;
        integrationIdentifier?: string;
    };
    sms?: Record<string, unknown>;
    push?: Record<string, unknown>;
    inApp?: Record<string, unknown>;
    chat?: Record<string, unknown>;
    layoutIdentifier?: string;
    severity?: SeverityLevelEnum;
};
