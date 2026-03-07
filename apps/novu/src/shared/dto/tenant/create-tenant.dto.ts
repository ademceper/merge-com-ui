import type { CustomDataType } from "../../model";

export interface IConstructTenantDto {
	data?: CustomDataType;
}

export interface ICreateTenantDto extends IConstructTenantDto {
	name: string;
	identifier: string;
}
