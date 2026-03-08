import { generateEncodedPath } from "../generate-encoded-path";

// keys-tab
export type KeySubTab = "list" | "providers";

type KeysParams = {
    realm: string;
    tab: KeySubTab;
};

export const toKeysTab = (params: KeysParams): string =>
    generateEncodedPath("/:realm/realm-settings/keys/:tab", params);

// client-policies
export type ClientPoliciesTab = "profiles" | "policies";

type ClientPoliciesParams = {
    realm: string;
    tab: ClientPoliciesTab;
};

export const toClientPolicies = (params: ClientPoliciesParams): string =>
    generateEncodedPath("/:realm/realm-settings/client-policies/:tab", params);

// themes-tab
export type ThemesTabType = "settings" | "lightColors" | "darkColors";

type ThemesParams = {
    realm: string;
    tab: ThemesTabType;
};

export const toThemesTab = (params: ThemesParams): string =>
    generateEncodedPath("/:realm/realm-settings/themes/:tab", params);

// user-profile
export type UserProfileTab =
    | "attributes"
    | "attributes-group"
    | "unmanaged-attributes"
    | "json-editor";

type UserProfileParams = {
    realm: string;
    tab: UserProfileTab;
};

export const toUserProfile = (params: UserProfileParams): string =>
    generateEncodedPath("/:realm/realm-settings/user-profile/:tab", params);

// add-attribute
type AddAttributeParams = {
    realm: string;
};

export const toAddAttribute = (params: AddAttributeParams): string =>
    generateEncodedPath(
        "/:realm/realm-settings/user-profile/attributes/add-attribute",
        params
    );

// attribute
export type AttributeParams = {
    realm: string;
    attributeName: string;
};

export const toAttribute = (params: AttributeParams): string =>
    generateEncodedPath(
        "/:realm/realm-settings/user-profile/attributes/:attributeName/edit-attribute",
        params
    );

// new-attributes-group
type NewAttributesGroupParams = {
    realm: string;
};

export const toNewAttributesGroup = (params: NewAttributesGroupParams): string =>
    generateEncodedPath(
        "/:realm/realm-settings/user-profile/attributesGroup/new",
        params
    );

// edit-attributes-group
export type EditAttributesGroupParams = {
    realm: string;
    name: string;
};

export const toEditAttributesGroup = (params: EditAttributesGroupParams): string =>
    generateEncodedPath(
        "/:realm/realm-settings/user-profile/attributesGroup/edit/:name",
        params
    );

// add-client-policy
type AddClientPolicyParams = { realm: string };

export const toAddClientPolicy = (params: AddClientPolicyParams): string =>
    generateEncodedPath(
        "/:realm/realm-settings/client-policies/policies/add-client-policy",
        params
    );

// edit-client-policy
export type EditClientPolicyParams = {
    realm: string;
    policyName: string;
};

export const toEditClientPolicy = (params: EditClientPolicyParams): string =>
    generateEncodedPath(
        "/:realm/realm-settings/client-policies/:policyName/edit-policy",
        params
    );

// add-client-profile
type AddClientProfileParams = {
    realm: string;
    tab: string;
};

export const toAddClientProfile = (params: AddClientProfileParams): string =>
    generateEncodedPath(
        "/:realm/realm-settings/client-policies/:tab/add-profile",
        params
    );

// client-profile
export type ClientProfileParams = {
    realm: string;
    profileName: string;
};

export const toClientProfile = (params: ClientProfileParams): string =>
    generateEncodedPath(
        "/:realm/realm-settings/client-policies/:profileName/edit-profile",
        params
    );

// add-condition
type NewClientPolicyConditionParams = {
    realm: string;
    policyName: string;
};

export const toNewClientPolicyCondition = (
    params: NewClientPolicyConditionParams
): string =>
    generateEncodedPath(
        "/:realm/realm-settings/client-policies/:policyName/edit-policy/create-condition",
        params
    );

// edit-condition
export type EditClientPolicyConditionParams = {
    realm: string;
    policyName: string;
    conditionName: string;
};

export const toEditClientPolicyCondition = (
    params: EditClientPolicyConditionParams
): string =>
    generateEncodedPath(
        "/:realm/realm-settings/client-policies/:policyName/edit-policy/:conditionName/edit-condition",
        params
    );

// add-executor
type AddExecutorParams = {
    realm: string;
    profileName: string;
};

export const toAddExecutor = (params: AddExecutorParams): string =>
    generateEncodedPath(
        "/:realm/realm-settings/client-policies/:profileName/add-executor",
        params
    );

// executor
export type ExecutorParams = {
    realm: string;
    profileName: string;
    executorName: string;
};

export const toExecutor = (params: ExecutorParams): string =>
    generateEncodedPath(
        "/:realm/realm-settings/client-policies/:profileName/edit-profile/:executorName",
        params
    );

// key-provider
export type ProviderType =
    | "aes-generated"
    | "ecdsa-generated"
    | "hmac-generated"
    | "java-keystore"
    | "rsa"
    | "rsa-enc"
    | "rsa-enc-generated"
    | "rsa-generated";

export type KeyProviderParams = {
    id: string;
    providerType: ProviderType;
    realm: string;
};

export const toKeyProvider = (params: KeyProviderParams): string =>
    generateEncodedPath(
        "/:realm/realm-settings/keys/providers/:id/:providerType/settings",
        params
    );
