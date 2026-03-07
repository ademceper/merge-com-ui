import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

type NewClientPolicyConditionParams = {
    realm: string;
    policyName: string;
};

export const toNewClientPolicyCondition = (
    params: NewClientPolicyConditionParams
): string =>
    generateEncodedPath("/:realm/realm-settings/client-policies/:policyName/edit-policy/create-condition", params);
