import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

type RealmRolesParams = { realm: string };

export const toRealmRoles = (params: RealmRolesParams): string =>
    generateEncodedPath("/:realm/roles", params);
