import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

export type ScopeDetailsParams = {
    realm: string;
    id: string;
    scopeId?: string;
};

export const toScopeDetails = (params: ScopeDetailsParams): string => {
    const path = params.scopeId
        ? "/:realm/clients/:id/authorization/scope/:scopeId"
        : "/:realm/clients/:id/authorization/scope";
    return generateEncodedPath(path, params as any);
};
