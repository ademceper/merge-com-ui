/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/clients/scopes/DedicatedScope.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import type ClientRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientRepresentation";
import type { RoleMappingPayload } from "@keycloak/keycloak-admin-client/lib/defs/roleRepresentation";
import { AlertVariant } from "../../../shared/keycloak-ui-shared";
import { Label } from "@merge/ui/components/label";
import { Separator } from "@merge/ui/components/separator";
import { Switch } from "@merge/ui/components/switch";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { HelpItem } from "../../../shared/keycloak-ui-shared";
import { useAdminClient } from "../../admin-client";
import { useAlerts } from "../../../shared/keycloak-ui-shared";
import { FormAccess } from "../../components/form/FormAccess";
import { RoleMapping, Row } from "../../components/role-mapping/RoleMapping";
import { useAccess } from "../../context/access/Access";

type DedicatedScopeProps = {
    client: ClientRepresentation;
};

export const DedicatedScope = ({ client: initialClient }: DedicatedScopeProps) => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const { addAlert, addError } = useAlerts();

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

            addAlert(t("clientScopeSuccess"), AlertVariant.success);
        } catch (error) {
            addError("clientScopeError", error);
        }
    };

    const update = async () => {
        const newClient = { ...client, fullScopeAllowed: !client.fullScopeAllowed };
        try {
            await adminClient.clients.update({ id: client.id! }, newClient);
            addAlert(t("clientScopeSuccess"), AlertVariant.success);
            setClient(newClient);
        } catch (error) {
            addError("clientScopeError", error);
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
