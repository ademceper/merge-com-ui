import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

export type PermissionType = "resource" | "scope";

export type NewPermissionParams = {
    realm: string;
    id: string;
    permissionType: PermissionType;
    selectedId?: string;
};

export const toNewPermission = (params: NewPermissionParams): string => {
    const path = params.selectedId
        ? "/:realm/clients/:id/authorization/permission/new/:permissionType/:selectedId"
        : "/:realm/clients/:id/authorization/permission/new/:permissionType";
    return generateEncodedPath(path, params as any);
};
