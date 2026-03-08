export const eventKeys = {
    all: ["events"] as const,
    eventsConfig: (realm: string) => [...eventKeys.all, "config", realm] as const,
    adminEvents: (realm: string, filters: Record<string, unknown>) =>
        [...eventKeys.all, "admin", realm, filters] as const,
    userEvents: (realm: string, filters: Record<string, unknown>) =>
        [...eventKeys.all, "user", realm, filters] as const
};
