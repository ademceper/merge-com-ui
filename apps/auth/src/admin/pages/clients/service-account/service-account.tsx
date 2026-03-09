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
} from "@/shared/keycloak-ui-shared";
import { useAccess } from "@/admin/app/providers/access/access";
import { useAssignServiceAccountRoles } from "../hooks/use-service-account-roles";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import { toUser } from "@/admin/shared/lib/routes/user";
import { RoleMapping, type Row } from "@/admin/shared/ui/role-mapping/role-mapping";
import { useServiceAccountUser } from "../hooks/use-service-account-user";

const TransComponent = Trans as ComponentType<Record<string, unknown>>;
const RouterLink = Link as ComponentType<LinkProps>;

type ServiceAccountProps = {
    client: ClientRepresentation;
};

export const ServiceAccount = ({ client }: ServiceAccountProps) => {

    const { t } = useTranslation();
    const { realm } = useRealm();
    const { mutateAsync: assignRolesMutation } = useAssignServiceAccountRoles();

    const { data: serviceAccount } = useServiceAccountUser(client.id!);

    const { hasAccess } = useAccess();
    const hasManageClients = hasAccess("manage-clients");

    const assignRoles = async (rows: Row[]) => {
        try {
            const realmRoles = rows
                .filter(row => row.client === undefined)
                .flatMap(row => row.role as RoleMappingPayload);
            await assignRolesMutation({
                userId: serviceAccount?.id!,
                realmRoles: realmRoles as Record<string, unknown>[],
                clientRoles: rows
                    .filter(row => row.client !== undefined)
                    .map(row => ({
                        clientUniqueId: row.client!.id!,
                        roles: [row.role as Record<string, unknown>]
                    }))
            });
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
