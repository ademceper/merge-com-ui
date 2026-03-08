import type ClientRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientRepresentation";
import type { RoleMappingPayload } from "@keycloak/keycloak-admin-client/lib/defs/roleRepresentation";
import { Trans, useTranslation } from "@merge-rd/i18n";
import { Info } from "@phosphor-icons/react";
import { Link, type LinkProps } from "@tanstack/react-router";
import type { ComponentType } from "react";
import { toast } from "sonner";
import {
    getErrorDescription,
    getErrorMessage,
    KeycloakSpinner
} from "../../../../shared/keycloak-ui-shared";
import { useAdminClient } from "../../../app/admin-client";
import { useAccess } from "../../../app/providers/access/access";
import { useRealm } from "../../../app/providers/realm-context/realm-context";
import { RoleMapping, type Row } from "../../../shared/ui/role-mapping/role-mapping";
import { toUser } from "../../../shared/lib/routes/user";
import { useServiceAccountUser } from "../api/use-service-account-user";

const TransComponent = Trans as ComponentType<Record<string, unknown>>;
const RouterLink = Link as ComponentType<LinkProps>;

type ServiceAccountProps = {
    client: ClientRepresentation;
};

export const ServiceAccount = ({ client }: ServiceAccountProps) => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const { realm } = useRealm();

    const { data: serviceAccount } = useServiceAccountUser(client.id!);

    const { hasAccess } = useAccess();
    const hasManageClients = hasAccess("manage-clients");

    const assignRoles = async (rows: Row[]) => {
        try {
            const realmRoles = rows
                .filter(row => row.client === undefined)
                .flatMap(row => row.role as RoleMappingPayload);
            await adminClient.users.addRealmRoleMappings({
                id: serviceAccount?.id!,
                roles: realmRoles
            });
            await Promise.all(
                rows
                    .filter(row => row.client !== undefined)
                    .map(row =>
                        adminClient.users.addClientRoleMappings({
                            id: serviceAccount?.id!,
                            clientUniqueId: row.client!.id!,
                            roles: [row.role as RoleMappingPayload]
                        })
                    )
            );
            toast.success(t("roleMappingUpdatedSuccess"));
        } catch (error) {
            toast.error(t("roleMappingUpdatedError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        }
    };
    return serviceAccount ? (
        <>
            <div className="pb-0 flex items-center gap-2">
                <Info className="size-4 shrink-0" />
                <span>
                    <TransComponent i18nKey="manageServiceAccountUser">
                        {""}
                        <RouterLink
                            to={
                                toUser({
                                    realm,
                                    id: serviceAccount.id!,
                                    tab: "settings"
                                }) as string
                            }
                        >
                            {{ link: serviceAccount.username }}
                        </RouterLink>
                    </TransComponent>
                </span>
            </div>
            <RoleMapping
                name={client.clientId!}
                id={serviceAccount.id!}
                type="users"
                isManager={hasManageClients || client.access?.configure}
                save={assignRoles}
            />
        </>
    ) : (
        <KeycloakSpinner />
    );
};
