import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

export type ExecutorParams = {
    realm: string;
    profileName: string;
    executorName: string;
};

export const toExecutor = (params: ExecutorParams): string =>
    generateEncodedPath("/:realm/realm-settings/client-policies/:profileName/edit-profile/:executorName", params);
