import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

export type NewRoleParams = { realm: string; clientId: string };

export const toCreateRole = (params: NewRoleParams): string =>
    generateEncodedPath("/:realm/clients/:clientId/roles/new", params);
