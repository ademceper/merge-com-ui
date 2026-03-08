import type WhoAmIRepresentation from "@keycloak/keycloak-admin-client/lib/defs/whoAmIRepresentation";
import { DEFAULT_LOCALE } from "@merge-rd/i18n";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { type PropsWithChildren, useCallback, useEffect, useMemo } from "react";
import {
    createNamedContext,
    KeycloakSpinner,
    useEnvironment,
    useRequiredContext
} from "../../../../shared/keycloak-ui-shared";
import { useAdminClient } from "../../admin-client";
import { i18n } from "../../i18n";
import { useRealm } from "../realm-context/realm-context";

const RTL_LOCALES = [
    "ar",
    "dv",
    "fa",
    "ha",
    "he",
    "iw",
    "ji",
    "ps",
    "sd",
    "ug",
    "ur",
    "yi"
];

type WhoAmIProps = {
    refresh: () => void;
    whoAmI: WhoAmIRepresentation;
};

const WhoAmIContext = createNamedContext<WhoAmIProps | undefined>(
    "WhoAmIContext",
    undefined
);

export const useWhoAmI = () => useRequiredContext(WhoAmIContext);

export const WhoAmIContextProvider = ({ children }: PropsWithChildren) => {
    const { adminClient } = useAdminClient();
    const { environment } = useEnvironment();
    const queryClient = useQueryClient();
    const { realm } = useRealm();

    const refresh = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ["whoAmI", environment.realm, realm] });
    }, [queryClient, environment.realm, realm]);

    const { data: whoAmI } = useQuery({
        queryKey: ["whoAmI", environment.realm, realm],
        staleTime: Number.POSITIVE_INFINITY,
        queryFn: async () => {
            try {
                return await adminClient.whoAmI.find({
                    realm: environment.realm,
                    currentRealm: realm
                });
            } catch (error) {
                console.warn(
                    "Unable to fetch whoami, falling back to empty defaults.",
                    error
                );

                return {
                    realm: "",
                    userId: "",
                    displayName: "",
                    locale: DEFAULT_LOCALE,
                    createRealm: false,
                    realm_access: {},
                    temporary: false
                };
            }
        }
    });

    useEffect(() => {
        if (whoAmI?.locale) {
            i18n.changeLanguage(whoAmI.locale);
        }
    }, [whoAmI?.locale]);

    useEffect(() => {
        if (whoAmI?.locale && RTL_LOCALES.includes(whoAmI.locale)) {
            document.documentElement.setAttribute("dir", "rtl");
        } else {
            document.documentElement.removeAttribute("dir");
        }
    }, [whoAmI?.locale]);

    const value = useMemo(
        () => ({ refresh, whoAmI: whoAmI! }),
        [refresh, whoAmI]
    );

    if (!whoAmI) {
        return <KeycloakSpinner />;
    }

    return (
        <WhoAmIContext.Provider value={value}>
            {children}
        </WhoAmIContext.Provider>
    );
};
