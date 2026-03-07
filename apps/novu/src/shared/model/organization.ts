export type OrganizationId = string;

export enum ApiServiceLevelEnum {
	FREE = "free",
	PRO = "pro",
	BUSINESS = "business",
	ENTERPRISE = "enterprise",
	UNLIMITED = "unlimited",
}

enum StripeBillingIntervalEnum {
	MONTH = "month",
	YEAR = "year",
}

enum ProductUseCasesEnum {
	IN_APP = "in_app",
	MULTI_CHANNEL = "multi_channel",
	DELAY = "delay",
	TRANSLATION = "translation",
	DIGEST = "digest",
}

type ProductUseCases = Partial<Record<ProductUseCasesEnum, boolean>>;

type OrganizationPublicMetadata = {
	externalOrgId?: string;
	domain?: string;
	productUseCases?: ProductUseCases;
	language?: string[];
	defaultLocale?: string;
	companySize?: string;
};
