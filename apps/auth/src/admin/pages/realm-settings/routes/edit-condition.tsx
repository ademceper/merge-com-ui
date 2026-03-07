import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

export type EditClientPolicyConditionParams = {
    realm: string;
    policyName: string;
    conditionName: string;
};

export const toEditClientPolicyCondition = (
    params: EditClientPolicyConditionParams
): string =>
    generateEncodedPath("/:realm/realm-settings/client-policies/:policyName/edit-policy/:conditionName/edit-condition", params);
