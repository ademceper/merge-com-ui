import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

type OrganizationsRouteParams = {
    realm: string;
};

export const toOrganizations = (params: OrganizationsRouteParams): string =>
    generateEncodedPath("/:realm/organizations", params);
