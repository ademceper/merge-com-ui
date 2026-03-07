import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

export type ResourceDetailsParams = {
    realm: string;
    id: string;
    resourceId?: string;
};

export const toResourceDetails = (params: ResourceDetailsParams): string => {
    const path = params.resourceId
        ? "/:realm/clients/:id/authorization/resource/:resourceId"
        : "/:realm/clients/:id/authorization/resource";
    return generateEncodedPath(path, params as any);
};
