import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

type ClientScopesTab = "setup" | "evaluate";

type ClientScopesParams = {
    realm: string;
    clientId: string;
    tab: ClientScopesTab;
};

const toClientScopesTab = (params: ClientScopesParams): string =>
    generateEncodedPath("/:realm/clients/:clientId/clientScopes/:tab", params);
