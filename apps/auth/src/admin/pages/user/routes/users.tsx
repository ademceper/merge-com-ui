import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

type UserTab = "list" | "permissions";

type UsersParams = { realm: string; tab?: UserTab };

export const toUsers = (params: UsersParams): string => {
    const path = params.tab ? "/:realm/users/:tab" : "/:realm/users";
    return generateEncodedPath(path, params as any);
};
