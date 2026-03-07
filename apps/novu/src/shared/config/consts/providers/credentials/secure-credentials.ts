import { CredentialsKeyEnum } from "@/shared/model";

export const secureCredentials: CredentialsKeyEnum[] = [
	CredentialsKeyEnum.ApiKey,
	CredentialsKeyEnum.ApiToken,
	CredentialsKeyEnum.SecretKey,
	CredentialsKeyEnum.Token,
	CredentialsKeyEnum.Password,
	CredentialsKeyEnum.ServiceAccount,
];
