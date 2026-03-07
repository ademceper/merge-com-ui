import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

type AddOrganizationParams = { realm: string };

const toAddOrganization = (params: AddOrganizationParams): string =>
    generateEncodedPath("/:realm/organizations/new", params);
