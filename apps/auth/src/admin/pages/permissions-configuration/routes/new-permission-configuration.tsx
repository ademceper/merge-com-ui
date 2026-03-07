import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

type NewPermissionConfigurationParams = {
    realm: string;
    permissionClientId: string;
    resourceType: string;
};

export const toCreatePermissionConfiguration = (
    params: NewPermissionConfigurationParams
): string =>
    generateEncodedPath("/:realm/permissions/:permissionClientId/permission/new/:resourceType", params);
