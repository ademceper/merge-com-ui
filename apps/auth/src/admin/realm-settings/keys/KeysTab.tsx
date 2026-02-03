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
import { useState } from "react";

import { useFetch } from "../../../shared/keycloak-ui-shared";
import { useAdminClient } from "../../admin-client";
import { KeycloakSpinner } from "../../../shared/keycloak-ui-shared";
import { useRealm } from "../../context/realm-context/RealmContext";
import { KEY_PROVIDER_TYPE } from "../../util";
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

type KeysTabProps = {
    subTab?: string;
};

export const KeysTab = ({ subTab = "list" }: KeysTabProps) => {
    const { adminClient } = useAdminClient();
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

    if (!realmComponents) {
        return <KeycloakSpinner />;
    }

    if (subTab === "providers") {
        return <KeysProvidersTab realmComponents={realmComponents} refresh={refresh} />;
    }

    return <KeysListTab realmComponents={realmComponents} />;
};
