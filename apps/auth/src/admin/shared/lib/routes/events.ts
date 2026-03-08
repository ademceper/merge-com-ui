import { generateEncodedPath } from "../generateEncodedPath";

export type EventsTab = "user-events" | "admin-events";

type EventsParams = {
    realm: string;
    tab?: EventsTab;
};

export const toEvents = (params: EventsParams): string => {
    const path = params.tab ? "/:realm/events/:tab" : "/:realm/events";
    return generateEncodedPath(path, params as any);
};
