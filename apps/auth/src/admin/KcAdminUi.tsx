import type { ComponentType } from "react";
import { useEffect, useReducer } from "react";
import { startColorSchemeManagement } from "./colorScheme";
import { createHashRouter, RouterProvider } from "react-router-dom";
import { i18n } from "./i18n/i18n";
import { RootRoute } from "./routes";

document.title = "Keycloak Administration Console";

const router = createHashRouter([RootRoute]);
const prI18nInitialized = i18n.init();
startColorSchemeManagement();

const RouterProviderComponent = RouterProvider as ComponentType<{ router: typeof router }>;

export default function KcAdminUi() {
    const [isI18nInitialized, setI18nInitialized] = useReducer(() => true, false);

    useEffect(() => {
        prI18nInitialized.then(() => setI18nInitialized());
    }, []);

    if (!isI18nInitialized) {
        return null;
    }

    return <RouterProviderComponent router={router} />;
}
