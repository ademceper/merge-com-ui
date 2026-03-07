import type { IConstructTenantDto } from "./create-tenant.dto";

interface IUpdateTenantDto extends IConstructTenantDto {
	name?: string;
	identifier?: string;
}
