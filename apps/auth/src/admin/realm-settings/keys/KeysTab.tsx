/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/realm-settings/keys/KeysTab.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import type ComponentRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentRepresentation";
import { Tab } from "../../components/routable-tabs/RoutableTabs";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useFetch } from "../../../shared/keycloak-ui-shared";
import { useAdminClient } from "../../admin-client";
import { KeycloakSpinner } from "../../../shared/keycloak-ui-shared";
import {
    RoutableTabs,
    useRoutableTab
} from "../../components/routable-tabs/RoutableTabs";
import { useRealm } from "../../context/realm-context/RealmContext";
import { KEY_PROVIDER_TYPE } from "../../util";
import { KeySubTab, toKeysTab } from "../routes/KeysTab";
import { KeysListTab } from "./KeysListTab";
import { KeysProvidersTab } from "./KeysProvidersTab";

const sortByPriority = (components: ComponentRepresentation[]) => {
    const sortedComponents = [...components].sort((a, b) => {
        const priorityA = Number(a.config?.priority);
        const priorityB = Number(b.config?.priority);

        return (!isNaN(priorityB) ? priorityB : 0) - (!isNaN(priorityA) ? priorityA : 0);
    });

    return sortedComponents;
};

export const KeysTab = () => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();

    const { realm: realmName } = useRealm();

    const [realmComponents, setRealmComponents] = useState<ComponentRepresentation[]>();
    const [key, setKey] = useState(0);
    const refresh = () => {
        setKey(key + 1);
    };

    useFetch(
        () =>
            adminClient.components.find({
                type: KEY_PROVIDER_TYPE,
                realm: realmName
            }),
        components => setRealmComponents(sortByPriority(components)),
        [key]
    );

    const useTab = (tab: KeySubTab) =>
        useRoutableTab(toKeysTab({ realm: realmName, tab }));

    const listTab = useTab("list");
    const providersTab = useTab("providers");

    if (!realmComponents) {
        return <KeycloakSpinner />;
    }

    return (
        <RoutableTabs
            mountOnEnter
            unmountOnExit
            defaultLocation={toKeysTab({ realm: realmName, tab: "list" })}
        >
            <Tab
                id="keysList"
                data-testid="rs-keys-list-tab"
                aria-label="keys-list-subtab"
                title={t("keysList")}
                eventKey={listTab.eventKey}
            >
                <KeysListTab realmComponents={realmComponents} />
            </Tab>
            <Tab
                id="providers"
                data-testid="rs-providers-tab"
                aria-label="rs-providers-tab"
                title={t("providers")}
                eventKey={providersTab.eventKey}
            >
                <KeysProvidersTab realmComponents={realmComponents} refresh={refresh} />
            </Tab>
        </RoutableTabs>
    );
};
