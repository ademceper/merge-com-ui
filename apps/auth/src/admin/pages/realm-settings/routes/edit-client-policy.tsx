import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

export type EditClientPolicyParams = {
    realm: string;
    policyName: string;
};

export const toEditClientPolicy = (params: EditClientPolicyParams): string =>
    generateEncodedPath("/:realm/realm-settings/client-policies/:policyName/edit-policy", params);
