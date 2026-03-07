/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "account/KcPage.tsx"
 *
 * This file is provided by @keycloakify/keycloak-account-ui version 260502.0.2.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

import { lazy } from "react";
import { KcAccountUiLoader } from "@keycloakify/keycloak-account-ui";
import type { KcContext } from "./kc-context";
import { oidcEarlyInit } from "oidc-spa/entrypoint";
import { browserRuntimeFreeze } from "oidc-spa/browser-runtime-freeze";
import { DPoP } from "oidc-spa/DPoP";

const KcAccountUi = lazy(() => import("./kc-account-ui"));

export default function KcPage(props: { kcContext: KcContext }) {
    const { kcContext } = props;

    const { shouldLoadApp } = oidcEarlyInit({
        BASE_URL: kcContext.baseUrl.path,
        sessionRestorationMethod: import.meta.env.DEV ? "full page redirect" : "auto",
        securityDefenses: {
            ...browserRuntimeFreeze({ excludes: ["fetch"] }),
            ...DPoP({ mode: "auto" })
        }
    });

    if (!shouldLoadApp) {
        return null;
    }

    return <KcAccountUiLoader kcContext={kcContext} KcAccountUi={KcAccountUi} />;
}
