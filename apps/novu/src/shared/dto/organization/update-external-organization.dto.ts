import type {
	ChannelTypeEnum,
	JobTitleEnum,
	OrganizationTypeEnum,
} from "../../model";

type UpdateExternalOrganizationDto = {
	jobTitle?: JobTitleEnum;
	domain?: string;
	language?: string[];
	frontendStack?: string[];
	companySize?: string;
	organizationType?: OrganizationTypeEnum;
	useCases?: ChannelTypeEnum[];
};
