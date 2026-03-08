export const groupKeys = {
    all: ["groups"] as const,
    lists: () => [...groupKeys.all, "list"] as const,
    list: (filters?: Record<string, unknown>) => [...groupKeys.lists(), filters] as const,
    detail: (id: string) => [...groupKeys.all, "detail", id] as const,
    subGroups: (parentId: string) => [...groupKeys.all, "subGroups", parentId] as const,
    tree: (filters?: Record<string, unknown>) =>
        [...groupKeys.all, "tree", filters] as const,
    members: (groupId: string, filters?: Record<string, unknown>) =>
        [...groupKeys.all, "members", groupId, filters] as const,
    memberships: (userId: string, filters?: Record<string, unknown>) =>
        [...groupKeys.all, "memberships", userId, filters] as const,
    navigationPath: (ids: string[]) =>
        [...groupKeys.all, "navigationPath", ...ids] as const
};
