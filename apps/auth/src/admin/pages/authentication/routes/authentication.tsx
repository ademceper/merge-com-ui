import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

export type AuthenticationTab = "flows" | "required-actions" | "policies";

type AuthenticationParams = { realm: string; tab?: AuthenticationTab };

export const toAuthentication = (params: AuthenticationParams): string => {
    const path = params.tab ? "/:realm/authentication/:tab" : "/:realm/authentication";
    return generateEncodedPath(path, params as any);
};
