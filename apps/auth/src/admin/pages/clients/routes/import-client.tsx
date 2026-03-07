import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

type ImportClientParams = { realm: string };

const toImportClient = (params: ImportClientParams): string =>
    generateEncodedPath("/:realm/clients/import-client", params);
