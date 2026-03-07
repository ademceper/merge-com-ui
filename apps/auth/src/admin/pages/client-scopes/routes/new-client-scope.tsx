import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

type NewClientScopeParams = { realm: string };

const toNewClientScope = (params: NewClientScopeParams): string =>
    generateEncodedPath("/:realm/client-scopes/new", params);
