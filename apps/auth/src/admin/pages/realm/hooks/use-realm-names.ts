import { useQuery } from "@tanstack/react-query";
import type { RealmNameRepresentation } from "@/admin/api/realm";
import { fetchRealmNames } from "@/admin/api/realm";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import { realmKeys } from "./keys";

const MOCK_REALMS: RealmNameRepresentation[] = [
    { name: "master", displayName: "Master Realm" },
    { name: "merge-dev", displayName: "Merge Development" },
    { name: "merge-staging", displayName: "Merge Staging" },
    { name: "merge-prod", displayName: "Merge Production" }
];

export function useRealmNames() {
    const { realm } = useRealm();
    return useQuery({
        queryKey: realmKeys.names(realm),
        queryFn: () => Promise.resolve(MOCK_REALMS)
    });
}
