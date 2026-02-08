import type RoleRepresentation from "@keycloak/keycloak-admin-client/lib/defs/roleRepresentation";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@merge/ui/components/tabs";
import { useAdminClient } from "../admin-client";
import {
    getErrorDescription,
    getErrorMessage,
} from "../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { FormPanel } from "../../shared/keycloak-ui-shared";
import { RoleMapping } from "../components/role-mapping/RoleMapping";
import { useRealm } from "../context/realm-context/RealmContext";
import { DefaultGroupsTab } from "./DefaultGroupsTab";

export const UserRegistration = () => {
    const { adminClient } = useAdminClient();
    const { t } = useTranslation();
    const { realmRepresentation: realm, realm: realmName } = useRealm();
    const [key, setKey] = useState(0);
    const [activeTab, setActiveTab] = useState("roles");

    const addComposites = async (composites: RoleRepresentation[]) => {
        try {
            await adminClient.roles.createComposite(
                { roleId: realm?.defaultRole!.id!, realm: realmName },
                composites,
            );
            setKey(key + 1);
            toast.success(t("addAssociatedRolesSuccess"));
        } catch (error) {
            toast.error(
                t("addAssociatedRolesError", {
                    error: getErrorMessage(error),
                }),
                { description: getErrorDescription(error) },
            );
        }
    };

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="mb-4 w-full min-w-0 overflow-x-auto overflow-y-hidden">
                <TabsList
                    variant="line"
                    className="mb-0 w-max min-w-0 **:data-[slot=tabs-trigger]:flex-none"
                >
                    <TabsTrigger value="roles" data-testid="default-roles-tab">
                        {t("defaultRoles")}
                    </TabsTrigger>
                    <TabsTrigger value="groups" data-testid="default-groups-tab">
                        {t("defaultGroups")}
                    </TabsTrigger>
                </TabsList>
            </div>
            <TabsContent value="roles" className="mt-0 pt-0 outline-none">
                <FormPanel
                    title={t("defaultRoles")}
                    className="mt-6 space-y-6"
                >
                    <div className="space-y-4">
                        <RoleMapping
                            name={realm?.defaultRole!.name!}
                            id={realm?.defaultRole!.id!}
                            type="roles"
                            isManager
                            save={(rows) =>
                                addComposites(rows.map((r) => r.role))
                            }
                        />
                    </div>
                </FormPanel>
            </TabsContent>
            <TabsContent value="groups" className="mt-0 pt-0 outline-none">
                <FormPanel
                    title={t("defaultGroups")}
                    className="mt-6 space-y-6"
                >
                    <DefaultGroupsTab />
                </FormPanel>
            </TabsContent>
        </Tabs>
    );
};
