import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

type PermissionsConfigurationParams = { realm: string };

const toPermissionsConfiguration = (
    params: PermissionsConfigurationParams
): string =>
    generateEncodedPath("/:realm/permissions", params);
