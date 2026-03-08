import { generateEncodedPath } from "../generateEncodedPath";

type NewPermissionConfigurationParams = {
    realm: string;
    permissionClientId: string;
    resourceType: string;
};

export const toCreatePermissionConfiguration = (
    params: NewPermissionConfigurationParams
): string =>
    generateEncodedPath(
        "/:realm/permissions/:permissionClientId/permission/new/:resourceType",
        params
    );

export type PermissionConfigurationDetailsParams = {
    realm: string;
    permissionClientId: string;
    permissionId: string;
    resourceType: string;
};

export const toPermissionConfigurationDetails = (
    params: PermissionConfigurationDetailsParams
): string =>
    generateEncodedPath(
        "/:realm/permissions/:permissionClientId/permission/:permissionId/:resourceType",
        params
    );

export type NewPermissionPolicyDetailsParams = {
    realm: string;
    permissionClientId: string;
    policyType: string;
};

export const toCreatePermissionPolicy = (
    params: NewPermissionPolicyDetailsParams
): string =>
    generateEncodedPath(
        "/:realm/permissions/:permissionClientId/policies/new/:policyType",
        params
    );

type PermissionPolicyDetailsParams = {
    realm: string;
    permissionClientId: string;
    policyId: string;
    policyType: string;
};

export const toPermissionPolicyDetails = (
    params: PermissionPolicyDetailsParams
): string =>
    generateEncodedPath(
        "/:realm/permissions/:permissionClientId/policies/:policyId/:policyType",
        params
    );
