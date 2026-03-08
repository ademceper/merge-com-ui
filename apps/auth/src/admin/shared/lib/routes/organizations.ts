import { generateEncodedPath } from "../generateEncodedPath";

// Organizations
type OrganizationsRouteParams = {
    realm: string;
};

export const toOrganizations = (params: OrganizationsRouteParams): string =>
    generateEncodedPath("/:realm/organizations", params);

// Edit Organization
export type OrganizationTab =
    | "settings"
    | "attributes"
    | "members"
    | "identityProviders"
    | "events";

export type EditOrganizationParams = {
    realm: string;
    id: string;
    tab: OrganizationTab;
};

export const toEditOrganization = (params: EditOrganizationParams): string =>
    generateEncodedPath("/:realm/organizations/:id/:tab", params);
