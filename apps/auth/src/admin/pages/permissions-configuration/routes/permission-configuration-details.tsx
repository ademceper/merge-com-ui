import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

export type PermissionConfigurationDetailsParams = {
    realm: string;
    permissionClientId: string;
    permissionId: string;
    resourceType: string;
};

export const toPermissionConfigurationDetails = (
    params: PermissionConfigurationDetailsParams
): string =>
    generateEncodedPath("/:realm/permissions/:permissionClientId/permission/:permissionId/:resourceType", params);
