import { useEffect, useReducer } from "react";
import { startColorSchemeManagement } from "./colorScheme";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { createHashHistory } from "@tanstack/react-router";
import { i18n } from "./i18n";
import { routeTree } from "../routeTree.gen";

document.title = "Merge Administration Console";

const hashHistory = createHashHistory();
const router = createRouter({
    routeTree,
    history: hashHistory,
});


const prI18nInitialized = i18n.init();
startColorSchemeManagement();

export default function KcAdminUi() {
    const [isI18nInitialized, setI18nInitialized] = useReducer(() => true, false);

    useEffect(() => {
        prI18nInitialized.then(() => setI18nInitialized());
    }, []);

    if (!isI18nInitialized) {
        return null;
    }

    return <RouterProvider router={router} />;
}
