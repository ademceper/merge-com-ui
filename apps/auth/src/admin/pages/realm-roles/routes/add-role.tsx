import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

type AddRoleParams = { realm: string };

const toAddRole = (params: AddRoleParams): string =>
    generateEncodedPath("/:realm/roles/new", params);
