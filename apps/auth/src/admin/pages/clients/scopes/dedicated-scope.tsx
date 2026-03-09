import type ClientRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientRepresentation";
import type { RoleMappingPayload } from "@keycloak/keycloak-admin-client/lib/defs/roleRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Label } from "@merge-rd/ui/components/label";
import { Separator } from "@merge-rd/ui/components/separator";
import { Switch } from "@merge-rd/ui/components/switch";
import { useState } from "react";
import { toast } from "sonner";
import {
    getErrorDescription,
    getErrorMessage,
    HelpItem
} from "@/shared/keycloak-ui-shared";
import { useAccess } from "@/admin/app/providers/access/access";
import { useAssignScopeMappings, useUpdateClientFullScope } from "../hooks/use-scope-mappings";
import { FormAccess } from "@/admin/shared/ui/form/form-access";
import { RoleMapping, type Row } from "@/admin/shared/ui/role-mapping/role-mapping";

type DedicatedScopeProps = {
    client: ClientRepresentation;
};

export const DedicatedScope = ({ client: initialClient }: DedicatedScopeProps) => {

    const { t } = useTranslation();
    const { mutateAsync: assignScopeMappings } = useAssignScopeMappings();
    const { mutateAsync: updateClientFullScope } = useUpdateClientFullScope();
    const [client, setClient] = useState<ClientRepresentation>(initialClient);

    const { hasAccess } = useAccess();
    const isManager = hasAccess("manage-clients") || client.access?.manage;

    const assignRoles = async (rows: Row[]) => {
        try {
            const realmRoles = rows
                .filter(row => row.client === undefined)
                .flatMap(row => row.role as RoleMappingPayload);
            await assignScopeMappings({
                clientId: client.id!,
                realmRoles,
                clientRoles: rows
                    .filter(row => row.client !== undefined)
                    .map(row => ({
                        targetClientId: row.client!.id!,
                        roles: [row.role as Record<string, unknown>]
                    }))
            });

            toast.success(t("clientScopeSuccess"));
        } catch (error) {
            toast.error(t("clientScopeError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        }
    };

    const update = async () => {
        const newClient = { ...client, fullScopeAllowed: !client.fullScopeAllowed };
        try {
            await updateClientFullScope({ clientId: client.id!, client: newClient });
            toast.success(t("clientScopeSuccess"));
            setClient(newClient);
        } catch (error) {
            toast.error(t("clientScopeError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
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
