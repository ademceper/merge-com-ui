import { createHashHistory, createRouter, RouterProvider } from "@tanstack/react-router";
import { useEffect, useReducer } from "react";
import { KeycloakSpinner } from "@/shared/keycloak-ui-shared";
import { routeTree } from "../routeTree.gen";
import { ErrorRenderer } from "../shared/ui/error/error-renderer";
import { startColorSchemeManagement } from "./color-scheme";
import { i18n } from "./i18n";
import { queryClient } from "./query-client";

document.title = "Merge Administration Console";

const hashHistory = createHashHistory();
const router = createRouter({
    routeTree,
    history: hashHistory,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    defaultPendingComponent: KeycloakSpinner,
    defaultErrorComponent: ({ error }) => <ErrorRenderer error={error} />,
    context: { queryClient }
});


const prI18nInitialized = i18n.init();
startColorSchemeManagement();

export function KcAdminUi() {
    const [isI18nInitialized, setI18nInitialized] = useReducer(() => true, false);

    useEffect(() => {
        prI18nInitialized.then(() => setI18nInitialized());
    }, []);

    if (!isI18nInitialized) {
        return null;
    }

    return <RouterProvider router={router} />;
}
