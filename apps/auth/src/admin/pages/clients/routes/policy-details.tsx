import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

export type PolicyDetailsParams = {
    realm: string;
    id: string;
    policyId: string;
    policyType: string;
};

export const toPolicyDetails = (params: PolicyDetailsParams): string =>
    generateEncodedPath("/:realm/clients/:id/authorization/policy/:policyId/:policyType", params);
