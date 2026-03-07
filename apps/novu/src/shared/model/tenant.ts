import type { CustomDataType } from "./utils";

type TenantIdentifier = string;
export type TenantId = string;

interface ITenantPayload {
	name?: string;
	data?: CustomDataType;
}

export interface ITenantDefine extends ITenantPayload {
	identifier: string;
}
