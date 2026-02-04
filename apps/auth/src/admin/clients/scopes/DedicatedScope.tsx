import type ClientRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientRepresentation";
import type { RoleMappingPayload } from "@keycloak/keycloak-admin-client/lib/defs/roleRepresentation";
import { Label } from "@merge/ui/components/label";
import { Separator } from "@merge/ui/components/separator";
import { Switch } from "@merge/ui/components/switch";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { HelpItem } from "../../../shared/keycloak-ui-shared";
import { useAdminClient } from "../../admin-client";
import { getErrorDescription, getErrorMessage } from "../../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { FormAccess } from "../../components/form/FormAccess";
import { RoleMapping, Row } from "../../components/role-mapping/RoleMapping";
import { useAccess } from "../../context/access/Access";

type DedicatedScopeProps = {
    client: ClientRepresentation;
};

export const DedicatedScope = ({ client: initialClient }: DedicatedScopeProps) => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
const [client, setClient] = useState<ClientRepresentation>(initialClient);

    const { hasAccess } = useAccess();
    const isManager = hasAccess("manage-clients") || client.access?.manage;

    const assignRoles = async (rows: Row[]) => {
        try {
            const realmRoles = rows
                .filter(row => row.client === undefined)
                .map(row => row.role as RoleMappingPayload)
                .flat();
            await Promise.all([
                adminClient.clients.addRealmScopeMappings(
                    {
                        id: client.id!
                    },
                    realmRoles
                ),
                ...rows
                    .filter(row => row.client !== undefined)
                    .map(row =>
                        adminClient.clients.addClientScopeMappings(
                            {
                                id: client.id!,
                                client: row.client!.id!
                            },
                            [row.role as RoleMappingPayload]
                        )
                    )
            ]);

            toast.success(t("clientScopeSuccess"));
        } catch (error) {
            toast.error(t("clientScopeError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    const update = async () => {
        const newClient = { ...client, fullScopeAllowed: !client.fullScopeAllowed };
        try {
            await adminClient.clients.update({ id: client.id! }, newClient);
            toast.success(t("clientScopeSuccess"));
            setClient(newClient);
        } catch (error) {
            toast.error(t("clientScopeError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    return (
        <div className="p-6">
            <FormAccess
                role="manage-clients"
                fineGrainedAccess={client.access?.manage}
                isHorizontal
            >
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Label>{t("fullScopeAllowed")}</Label>
                        <HelpItem
                            helpText={t("fullScopeAllowedHelp")}
                            fieldLabelId="fullScopeAllowed"
                        />
                    </div>
                    <Switch
                        id="fullScopeAllowed"
                        checked={client.fullScopeAllowed}
                        onCheckedChange={update}
                        aria-label={t("fullScopeAllowed")}
                    />
                </div>
            </FormAccess>
            {!client.fullScopeAllowed && (
                <>
                    <Separator />
                    <RoleMapping
                        name={client.clientId!}
                        id={client.id!}
                        type="clients"
                        save={assignRoles}
                        isManager={isManager}
                    />
                </>
            )}
        </div>
    );
};
