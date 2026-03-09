import { generateEncodedPath } from "@/admin/shared/lib/generateEncodedPath";

type RealmParams = { realm: string };

export const toRealm = (params: RealmParams): string =>
    generateEncodedPath("/:realm/realms", params);
