import { type FilterType } from "@/admin/api/sessions";

export const sessionKeys = {
    all: ["sessions"] as const,
    list: (filterType: FilterType) => [...sessionKeys.all, "list", filterType] as const
};
