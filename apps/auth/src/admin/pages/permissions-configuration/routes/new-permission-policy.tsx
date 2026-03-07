import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

export type NewPermissionPolicyDetailsParams = {
    realm: string;
    permissionClientId: string;
    policyType: string;
};

export const toCreatePermissionPolicy = (
    params: NewPermissionPolicyDetailsParams
): string =>
    generateEncodedPath("/:realm/permissions/:permissionClientId/policies/new/:policyType", params);
