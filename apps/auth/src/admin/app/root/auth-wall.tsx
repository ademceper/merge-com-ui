import { AccessType } from "@keycloak/keycloak-admin-client/lib/defs/whoAmIRepresentation";
import { useMatches } from "@tanstack/react-router";

import { ForbiddenSection } from "../../pages/forbidden-section";
import { useAccess } from "../providers/access/access";

function hasProp<K extends PropertyKey>(
    data: object,
    prop: K
): data is Record<K, unknown> {
    return prop in data;
}

export const AuthWall = ({ children }: any) => {
    const matches = useMatches();
    const { hasAccess } = useAccess();

    const permissionNeeded = matches.flatMap((match: any) => {
        const ctx = match.context || match.routeContext || {};
        if (typeof ctx !== "object" || ctx === null || !hasProp(ctx, "access")) {
            return [];
        }

        if (Array.isArray(ctx.access)) {
            return ctx.access as AccessType[];
        }

        return [ctx.access] as AccessType[];
    });

    if (!hasAccess(...permissionNeeded)) {
        return <ForbiddenSection permissionNeeded={permissionNeeded} />;
    }

    return children;
};
