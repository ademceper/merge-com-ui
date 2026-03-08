import type { AccessType } from "@keycloak/keycloak-admin-client/lib/defs/whoAmIRepresentation";
import { useMatches } from "@tanstack/react-router";
import type React from "react";
import { useMemo } from "react";

import { ForbiddenSection } from "../../pages/forbidden-section";
import { useAccess } from "../providers/access/access";

function hasProp<K extends PropertyKey>(
    data: object,
    prop: K
): data is Record<K, unknown> {
    return prop in data;
}

interface RouteMatchContext {
    context?: Record<string, unknown>;
    routeContext?: Record<string, unknown>;
}

export const AuthWall = ({ children }: React.PropsWithChildren) => {
    const matches = useMatches();
    const { hasAccess } = useAccess();

    const permissionNeeded = useMemo(
        () =>
            matches.flatMap((match: RouteMatchContext) => {
                const ctx = match.context || match.routeContext || {};
                if (typeof ctx !== "object" || ctx === null || !hasProp(ctx, "access")) {
                    return [];
                }

                if (Array.isArray(ctx.access)) {
                    return ctx.access as AccessType[];
                }

                return [ctx.access] as AccessType[];
            }),
        [matches]
    );

    if (!hasAccess(...permissionNeeded)) {
        return <ForbiddenSection permissionNeeded={permissionNeeded} />;
    }

    return children;
};
