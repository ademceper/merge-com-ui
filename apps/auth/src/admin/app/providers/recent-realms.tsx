import type RealmRepresentation from "@keycloak/keycloak-admin-client/lib/defs/realmRepresentation";
import { useQuery } from "@tanstack/react-query";
import { type PropsWithChildren, useEffect } from "react";
import {
    createNamedContext,
    useRequiredContext,
    useStoredState
} from "../../../shared/keycloak-ui-shared";
import { useAdminClient } from "../admin-client";
import { fetchAdminUI } from "./auth/admin-ui-endpoint";
import { useRealm } from "./realm-context/realm-context";

const MAX_REALMS = 3;

const RecentRealmsContext = createNamedContext<RealmNameRepresentation[] | undefined>(
    "RecentRealmsContext",
    undefined
);

export type RealmNameRepresentation = {
    name: string;
    displayName?: string;
};

function convertRealmToNameRepresentation(
    realm?: RealmRepresentation
): RealmNameRepresentation {
    return { name: realm?.realm || "", displayName: realm?.displayName || "" };
}

export const RecentRealmsProvider = ({ children }: PropsWithChildren) => {
    const { realmRepresentation: realm } = useRealm();
    const { adminClient } = useAdminClient();

    const [storedRealms, setStoredRealms] = useStoredState(localStorage, "recentRealms", [
        { name: "" }
    ] as RealmNameRepresentation[]);

    const { data: recentRealmsData } = useQuery({
        queryKey: ["recentRealms", realm?.realm === "master"],
        queryFn: () =>
            Promise.all(
                storedRealms.map(async r => {
                    if (!r.name) {
                        return undefined;
                    }
                    try {
                        return (
                            await fetchAdminUI<RealmNameRepresentation[]>(
                                adminClient,
                                "ui-ext/realms/names",
                                { search: r.name }
                            )
                        )[0];
                    } catch (error) {
                        console.info("recent realm not found", error);
                        return undefined;
                    }
                })
            )
    });
    useEffect(() => {
        if (recentRealmsData)
            setStoredRealms(
                recentRealmsData.filter((r): r is RealmNameRepresentation => !!r)
            );
    }, [recentRealmsData]);

    useEffect(() => {
        if (storedRealms.map(r => r.name).includes(realm?.realm || "") || !realm) {
            return;
        }
        setStoredRealms(
            [
                convertRealmToNameRepresentation(realm),
                ...storedRealms.filter(r => r.name !== "")
            ].slice(0, MAX_REALMS)
        );
    }, [realm]);

    return (
        <RecentRealmsContext.Provider value={storedRealms}>
            {children}
        </RecentRealmsContext.Provider>
    );
};

export const useRecentRealms = () => useRequiredContext(RecentRealmsContext);
