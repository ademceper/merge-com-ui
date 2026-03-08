import { KcAdminUiLoader } from "@keycloakify/keycloak-admin-ui";
import { browserRuntimeFreeze } from "oidc-spa/browser-runtime-freeze";
import { DPoP } from "oidc-spa/DPoP";
import { oidcEarlyInit } from "oidc-spa/entrypoint";
import { lazy } from "react";
import type { KcContext } from "./kc-context";

const { shouldLoadApp } = oidcEarlyInit({
    BASE_URL: location.pathname,
    sessionRestorationMethod: import.meta.env.DEV ? "full page redirect" : "auto",
    securityDefenses: {
        ...browserRuntimeFreeze({ excludes: ["fetch"] }),
        ...DPoP({ mode: "auto" })
    }
});

const KcAdminUi = lazy(() => import("./kc-admin-ui"));

export default function KcPage(props: { kcContext: KcContext }) {
    const { kcContext } = props;

    if (!shouldLoadApp) {
        return null;
    }

    return <KcAdminUiLoader kcContext={kcContext} KcAdminUi={KcAdminUi} />;
}
