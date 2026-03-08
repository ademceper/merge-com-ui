import { useQuery } from "@tanstack/react-query";
import { findOrganizations } from "../../../api/organizations";
import { organizationKeys } from "./keys";

export function useOrganizations() {
    return useQuery({
        queryKey: organizationKeys.lists(),
        queryFn: () => findOrganizations()
    });
}
