import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

type NewScopeParams = { realm: string; id: string };

export const toNewScope = (params: NewScopeParams): string =>
    generateEncodedPath("/:realm/clients/:id/authorization/scope/new", params);
