import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

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
