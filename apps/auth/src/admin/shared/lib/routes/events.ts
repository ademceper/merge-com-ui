import { generateEncodedPath } from "../generate-encoded-path";

export type EventsTab = "user-events" | "admin-events";

type EventsParams = {
    realm: string;
    tab?: EventsTab;
};

export const toEvents = (params: EventsParams): string => {
    if (params.tab) {
        return generateEncodedPath("/:realm/events/:tab", {
            realm: params.realm,
            tab: params.tab
        });
    }
    return generateEncodedPath("/:realm/events", { realm: params.realm });
};
