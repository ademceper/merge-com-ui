import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

type NewPolicyParams = { realm: string; id: string; policyType: string };

export const toCreatePolicy = (params: NewPolicyParams): string =>
    generateEncodedPath("/:realm/clients/:id/authorization/policy/new/:policyType", params);
