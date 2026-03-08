import { useQuery } from "@tanstack/react-query";
import { findUserFederationList } from "../../../api/user-federation";
import { federationKeys } from "./keys";

export function useUserFederationList(parentId: string | undefined) {
    return useQuery({
        queryKey: federationKeys.list(parentId ?? ""),
        queryFn: () => findUserFederationList(parentId!),
        enabled: !!parentId
    });
}
