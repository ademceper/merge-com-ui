import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

type PermissionPolicyDetailsParams = {
    realm: string;
    permissionClientId: string;
    policyId: string;
    policyType: string;
};

export const toPermissionPolicyDetails = (
    params: PermissionPolicyDetailsParams
): string =>
    generateEncodedPath("/:realm/permissions/:permissionClientId/policies/:policyId/:policyType", params);
