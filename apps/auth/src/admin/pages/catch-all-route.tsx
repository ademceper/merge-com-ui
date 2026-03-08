import { Navigate, useLocation } from "@tanstack/react-router";
import { useRealm } from "../app/providers/realm-context/realm-context";
import { generateEncodedPath } from "../shared/lib/generate-encoded-path";
import { ROUTES } from "../shared/lib/routes";

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
        "permissions"
    ];

    // If the path matches a known section, redirect with realm prefix
    for (const section of knownSections) {
        if (path === section || path.startsWith(`${section}/`)) {
            const targetPath = `/${realm}/${path}`;
            const searchStr = location.search
                ? `?${new URLSearchParams(location.search as Record<string, string>).toString()}`
                : "";
            return (
                <Navigate
                    to={`${targetPath}${searchStr}${location.hash || ""}` as string}
                    replace
                />
            );
        }
    }

    // Default: go to dashboard
    return (
        <Navigate to={generateEncodedPath(ROUTES.REALM, { realm }) as string} replace />
    );
};
