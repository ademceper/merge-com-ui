import type ComponentRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentRepresentation";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@merge/ui/components/tabs";
import { useFetch } from "../../../shared/keycloak-ui-shared";
import { useAdminClient } from "../../admin-client";
import { KeycloakSpinner } from "../../../shared/keycloak-ui-shared";
import { useRealm } from "../../context/realm-context/RealmContext";
import { toKeysTab } from "../routes/KeysTab";
import type { KeySubTab } from "../routes/KeysTab";
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
    const { t } = useTranslation();
    const navigate = useNavigate();
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

    const currentTab: KeySubTab = subTab === "providers" ? "providers" : "list";

    if (!realmComponents) {
        return <KeycloakSpinner />;
    }

    return (
        <Tabs
            value={currentTab}
            onValueChange={(value) =>
                navigate(toKeysTab({ realm: realmName!, tab: value as KeySubTab }))
            }
        >
            <TabsList variant="line" className="mb-4">
                <TabsTrigger value="list" data-testid="rs-keys-list-tab">
                    {t("keysList")}
                </TabsTrigger>
                <TabsTrigger value="providers" data-testid="rs-keys-providers-tab">
                    {t("providers")}
                </TabsTrigger>
            </TabsList>
            <TabsContent value="list">
                <KeysListTab realmComponents={realmComponents} />
            </TabsContent>
            <TabsContent value="providers">
                <KeysProvidersTab realmComponents={realmComponents} refresh={refresh} />
            </TabsContent>
        </Tabs>
    );
};
