import type {
	ChannelTypeEnum,
	JobTitleEnum,
	OrganizationTypeEnum,
} from "../../model";

export type UpdateExternalOrganizationDto = {
	jobTitle?: JobTitleEnum;
	domain?: string;
	language?: string[];
	frontendStack?: string[];
	companySize?: string;
	organizationType?: OrganizationTypeEnum;
	useCases?: ChannelTypeEnum[];
};
