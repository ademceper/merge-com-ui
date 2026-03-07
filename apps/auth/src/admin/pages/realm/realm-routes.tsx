import { generateEncodedPath } from "../../shared/lib/generateEncodedPath";

type RealmParams = { realm: string };

export const toRealm = (params: RealmParams): string =>
    generateEncodedPath("/:realm/realms", params);
