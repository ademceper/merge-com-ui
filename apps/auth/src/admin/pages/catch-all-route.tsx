import { Navigate, useLocation } from "react-router-dom";
import { useRealm } from "../app/providers/realm-context/realm-context";
import { ROUTES } from "../shared/lib/routes";
import { generateEncodedPath } from "../shared/lib/generateEncodedPath";

/**
 * Smart catch-all route that tries to resolve unknown paths
 * by matching them against known route patterns.
 * Falls back to the dashboard if no match is found.
 */
export const CatchAllRoute = () => {
    const { realm } = useRealm();
    const location = useLocation();
    const path = location.pathname.replace(/^\/+/, "");

    // Known top-level sections (without realm prefix)
    const knownSections = [
        "users",
        "clients",
        "client-scopes",
        "groups",
        "roles",
        "authentication",
        "identity-providers",
        "organizations",
        "realm-settings",
        "sessions",
        "events",
        "user-federation",
        "workflows",
        "permissions",
    ];

    // If the path matches a known section, redirect with realm prefix
    for (const section of knownSections) {
        if (path === section || path.startsWith(`${section}/`)) {
            const targetPath = `/${realm}/${path}`;
            return <Navigate to={`${targetPath}${location.search}${location.hash}`} replace />;
        }
    }

    // Default: go to dashboard
    return (
        <Navigate
            to={generateEncodedPath(ROUTES.REALM, { realm })}
            replace
        />
    );
};
