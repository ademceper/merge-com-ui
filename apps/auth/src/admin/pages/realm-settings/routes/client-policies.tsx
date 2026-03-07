import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

export type ClientPoliciesTab = "profiles" | "policies";

type ClientPoliciesParams = {
    realm: string;
    tab: ClientPoliciesTab;
};

export const toClientPolicies = (params: ClientPoliciesParams): string =>
    generateEncodedPath("/:realm/realm-settings/client-policies/:tab", params);
