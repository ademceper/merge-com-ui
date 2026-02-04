import type { RoleMappingPayload } from "@keycloak/keycloak-admin-client/lib/defs/roleRepresentation";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../admin-client";
import { getErrorDescription, getErrorMessage } from "../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { RoleMapping, Row } from "../components/role-mapping/RoleMapping";

type UserRoleMappingProps = {
    id: string;
    name: string;
};

export const UserRoleMapping = ({ id, name }: UserRoleMappingProps) => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
const assignRoles = async (rows: Row[]) => {
        try {
            const realmRoles = rows
                .filter(row => row.client === undefined)
                .map(row => row.role as RoleMappingPayload)
                .flat();
            await adminClient.users.addRealmRoleMappings({
                id,
                roles: realmRoles
            });
            await Promise.all(
                rows
                    .filter(row => row.client !== undefined)
                    .map(row =>
                        adminClient.users.addClientRoleMappings({
                            id,
                            clientUniqueId: row.client!.id!,
                            roles: [row.role as RoleMappingPayload]
                        })
                    )
            );
            toast.success(t("userRoleMappingUpdatedSuccess"));
        } catch (error) {
            toast.error(t("roleMappingUpdatedError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    return <RoleMapping name={name} id={id} type="users" save={assignRoles} />;
};
