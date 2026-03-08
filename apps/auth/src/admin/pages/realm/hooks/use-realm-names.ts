import { useQuery } from "@tanstack/react-query";
import { fetchRealmNames } from "../../../api/realm";
import { useRealm } from "../../../app/providers/realm-context/realm-context";
import { realmKeys } from "./keys";

export function useRealmNames() {
    const { realm } = useRealm();
    return useQuery({
        queryKey: realmKeys.names(realm),
        queryFn: () => fetchRealmNames()
    });
}
