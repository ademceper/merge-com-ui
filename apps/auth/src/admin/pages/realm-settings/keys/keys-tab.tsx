import { useTranslation } from "@merge-rd/i18n";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@merge-rd/ui/components/tabs";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { KeycloakSpinner } from "../../../../shared/keycloak-ui-shared";
import { useRealm } from "../../../app/providers/realm-context/realm-context";
import { realmSettingsKeys } from "../api/keys";
import { useKeyProviderComponents } from "../api/use-key-provider-components";
import { type KeySubTab, toKeysTab } from "../../../shared/lib/routes/realm-settings";
import { KeysListTab } from "./keys-list-tab";
import { KeysProvidersTab } from "./keys-providers-tab";

type KeysTabProps = {
    subTab?: string;
};

export const KeysTab = ({ subTab = "list" }: KeysTabProps) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { realm: realmName } = useRealm();
    const queryClient = useQueryClient();

    const { data: realmComponents } = useKeyProviderComponents();
    const refresh = () => {
        queryClient.invalidateQueries({
            queryKey: realmSettingsKeys.keyProviderComponents(realmName)
        });
    };

    const currentTab: KeySubTab = subTab === "providers" ? "providers" : "list";

    if (!realmComponents) {
        return <KeycloakSpinner />;
    }

    return (
        <Tabs
            value={currentTab}
            onValueChange={value =>
                navigate({
                    to: toKeysTab({
                        realm: realmName!,
                        tab: value as KeySubTab
                    }) as string
                })
            }
        >
            <div className="w-full min-w-0 overflow-x-auto overflow-y-hidden mb-4">
                <TabsList
                    variant="line"
                    className="mb-0 w-max min-w-0 **:data-[slot=tabs-trigger]:flex-none"
                >
                    <TabsTrigger value="list" data-testid="rs-keys-list-tab">
                        {t("keysList")}
                    </TabsTrigger>
                    <TabsTrigger value="providers" data-testid="rs-keys-providers-tab">
                        {t("providers")}
                    </TabsTrigger>
                </TabsList>
            </div>
            <TabsContent value="list" className="mt-0 pt-0 outline-none">
                <KeysListTab realmComponents={realmComponents} />
            </TabsContent>
            <TabsContent value="providers" className="mt-0 pt-0 outline-none">
                <KeysProvidersTab realmComponents={realmComponents} refresh={refresh} />
            </TabsContent>
        </Tabs>
    );
};
