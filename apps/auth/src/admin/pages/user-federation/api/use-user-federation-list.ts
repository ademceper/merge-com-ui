import { useQuery } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { findUserFederationList } from "../../../api/user-federation";
import { federationKeys } from "./keys";

export function useUserFederationList(parentId: string | undefined) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: federationKeys.list(parentId ?? ""),
        queryFn: () => findUserFederationList(adminClient, parentId!),
        enabled: !!parentId
    });
}
