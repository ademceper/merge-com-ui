import type { AccessType } from "@keycloak/keycloak-admin-client/lib/defs/whoAmIRepresentation";
import { type PropsWithChildren, useMemo } from "react";
import {
    createNamedContext,
    useRequiredContext
} from "../../../../shared/keycloak-ui-shared";
import { useRealm } from "../realm-context/realm-context";
import { useWhoAmI } from "../whoami/who-am-i";

type AccessContextProps = {
    hasAccess: (...types: AccessType[]) => boolean;
    hasSomeAccess: (...types: AccessType[]) => boolean;
};

const AccessContext = createNamedContext<AccessContextProps | undefined>(
    "AccessContext",
    undefined
);

export const useAccess = () => useRequiredContext(AccessContext);

export const AccessContextProvider = ({ children }: PropsWithChildren) => {
    const { whoAmI } = useWhoAmI();
    const { realm } = useRealm();
    const access = useMemo(() => whoAmI.realm_access[realm] ?? [], [whoAmI, realm]);

    const value = useMemo(() => {
        const hasAccess = (...types: AccessType[]): boolean => {
            return types.every(
                type =>
                    type === "anyone" ||
                    (typeof type === "function" &&
                        type({ hasAll: hasAccess, hasAny: hasSomeAccess })) ||
                    access.includes(type)
            );
        };

        const hasSomeAccess = (...types: AccessType[]): boolean => {
            return types.some(
                type =>
                    type === "anyone" ||
                    (typeof type === "function" &&
                        type({ hasAll: hasAccess, hasAny: hasSomeAccess })) ||
                    access.includes(type)
            );
        };

        return { hasAccess, hasSomeAccess };
    }, [access]);

    return (
        <AccessContext.Provider value={value}>
            {children}
        </AccessContext.Provider>
    );
};
