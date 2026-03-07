import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

type PermissionsPoliciesParams = {
    realm: string;
    permissionClientId: string;
};

const toPermissionsPolicies = (
    params: PermissionsPoliciesParams
): string =>
    generateEncodedPath("/:realm/permissions/:permissionClientId/policies", params);
