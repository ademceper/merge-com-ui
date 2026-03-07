import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

type GroupsParams = { realm: string; id?: string; lazy?: string };

export const toGroups = (params: GroupsParams): string => {
    const path = params.id ? "/:realm/groups/:id" : "/:realm/groups/*";
    return generateEncodedPath(path, params as any);
};
