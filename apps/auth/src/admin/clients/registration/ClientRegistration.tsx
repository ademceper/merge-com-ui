/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/clients/registration/ClientRegistration.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { useTranslation } from "react-i18next";
import { HelpItem } from "../../../shared/keycloak-ui-shared";
import {
    RoutableTabs,
    Tab,
    useRoutableTab
} from "../../components/routable-tabs/RoutableTabs";
import { useRealm } from "../../context/realm-context/RealmContext";
import {
    ClientRegistrationTab,
    toClientRegistration
} from "../routes/client-registration-path";
import { ClientRegistrationList } from "./ClientRegistrationList";

export const ClientRegistration = () => {
    const { t } = useTranslation();
    const { realm } = useRealm();

    const useTab = (subTab: ClientRegistrationTab) =>
        useRoutableTab(toClientRegistration({ realm, subTab }));

    const anonymousTab = useTab("anonymous");
    const authenticatedTab = useTab("authenticated");

    return (
        <RoutableTabs
            defaultLocation={toClientRegistration({ realm, subTab: "anonymous" })}
            mountOnEnter
            unmountOnExit
        >
            <Tab
                data-testid="anonymous"
                title={
                    <>
                        {t("anonymousAccessPolicies")}{" "}
                        <HelpItem
                            fieldLabelId=""
                            helpText={t("anonymousAccessPoliciesHelp")}
                            noVerticalAlign={false}
                            unWrap
                        />
                    </>
                }
                {...anonymousTab}
            >
                <ClientRegistrationList subType="anonymous" />
            </Tab>
            <Tab
                data-testid="authenticated"
                title={
                    <>
                        {t("authenticatedAccessPolicies")}{" "}
                        <HelpItem
                            fieldLabelId=""
                            helpText={t("authenticatedAccessPoliciesHelp")}
                            noVerticalAlign={false}
                            unWrap
                        />
                    </>
                }
                {...authenticatedTab}
            >
                <ClientRegistrationList subType="authenticated" />
            </Tab>
        </RoutableTabs>
    );
};
