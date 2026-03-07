import type { JobTitleEnum } from "../../model";

interface ICreateOrganizationDto {
	name: string;
	logo?: string;
	taxIdentifier?: string;
	jobTitle?: JobTitleEnum;
	domain?: string;
	language?: string[];
	frontend?: string[];
}

interface IOrganizationDTO {
	_id: string;
	name: string;
	createdAt: string;
	updatedAt: string;
}
