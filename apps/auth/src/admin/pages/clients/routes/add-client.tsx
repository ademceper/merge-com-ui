import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

type AddClientParams = { realm: string };

const toAddClient = (params: AddClientParams): string =>
    generateEncodedPath("/:realm/clients/add-client", params);
