import { type FilterType } from "../../../api/sessions";

export const sessionKeys = {
    all: ["sessions"] as const,
    list: (filterType: FilterType) => [...sessionKeys.all, "list", filterType] as const
};
