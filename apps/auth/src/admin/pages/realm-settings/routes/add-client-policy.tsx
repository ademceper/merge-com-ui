import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

type AddClientPolicyParams = { realm: string };

export const toAddClientPolicy = (params: AddClientPolicyParams): string =>
    generateEncodedPath("/:realm/realm-settings/client-policies/policies/add-client-policy", params);
