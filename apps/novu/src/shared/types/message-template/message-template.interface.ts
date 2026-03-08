import type {
    ChannelCTATypeEnum,
    EnvironmentId,
    IEmailBlock,
    ITemplateVariable,
    MessageTemplateContentType,
    OrganizationId,
    StepTypeEnum
} from "../../model";
import type { IActor } from "../actor";
import type { JSONSchemaDto } from "../workflows/json-schema-dto";
import type { UiSchema } from "../workflows/step.dto";

export interface IMessageTemplate {
    id?: string;
    _id?: string;
    _environmentId?: EnvironmentId;
    _organizationId?: OrganizationId;
    _creatorId?: string;
    _feedId?: string;
    _layoutId?: string | null;
    _parentId?: string;
    subject?: string;
    name?: string;
    title?: string;
    type: StepTypeEnum;
    contentType?: MessageTemplateContentType;
    content: string | IEmailBlock[];
    variables?: ITemplateVariable[];
    cta?: {
        type: ChannelCTATypeEnum;
        data: {
            url?: string;
        };
        action?: any;
    };
    active?: boolean;
    preheader?: string;
    senderName?: string;
    actor?: IActor;
    controls?: ControlSchemas;
    output?: {
        schema: JSONSchemaDto;
    };
    code?: string;
    createdAt?: string;
    updatedAt?: string;
}
export class ControlSchemas {
    schema: JSONSchemaDto;
    uiSchema?: UiSchema;
}
