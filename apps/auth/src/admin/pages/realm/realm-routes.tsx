import { generateEncodedPath } from "@/admin/shared/lib/generate-encoded-path";

type RealmParams = { realm: string };

export const toRealm = (params: RealmParams): string =>
    generateEncodedPath("/:realm/realms", params);
