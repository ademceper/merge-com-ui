import { generateEncodedPath } from "../generate-encoded-path";

type GroupsParams = { realm: string; id?: string; lazy?: string };

export const toGroups = (params: GroupsParams): string => {
    if (params.id) {
        return generateEncodedPath("/:realm/groups/:id", {
            realm: params.realm,
            id: params.id
        });
    }
    return generateEncodedPath("/:realm/groups/*", { realm: params.realm });
};
