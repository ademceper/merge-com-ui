import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

type AddExecutorParams = {
    realm: string;
    profileName: string;
};

export const toAddExecutor = (params: AddExecutorParams): string =>
    generateEncodedPath("/:realm/realm-settings/client-policies/:profileName/add-executor", params);
