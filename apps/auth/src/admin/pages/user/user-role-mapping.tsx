import type { RoleMappingPayload } from "@keycloak/keycloak-admin-client/lib/defs/roleRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { toast } from "sonner";
import { getErrorDescription, getErrorMessage } from "@/shared/keycloak-ui-shared";
import { RoleMapping, type Row } from "@/admin/shared/ui/role-mapping/role-mapping";
import { useAssignRoleMappings } from "./hooks/use-assign-role-mappings";

type UserRoleMappingProps = {
    id: string;
    name: string;
};

export const UserRoleMapping = ({ id, name }: UserRoleMappingProps) => {

    const { t } = useTranslation();
    const { mutateAsync: assignRoleMappingsMut } = useAssignRoleMappings();
    const assignRoles = async (rows: Row[]) => {
        try {
            const realmRoles = rows
                .filter(row => row.client === undefined)
                .flatMap(row => row.role as RoleMappingPayload);
            const clientRoles = rows
                .filter(row => row.client !== undefined)
                .map(row => ({
                    clientId: row.client!.id!,
                    roles: [row.role as RoleMappingPayload]
                }));
            await assignRoleMappingsMut({
                userId: id,
                realmRoles,
                clientRoles
            });
            toast.success(t("userRoleMappingUpdatedSuccess"));
        } catch (error) {
            toast.error(t("roleMappingUpdatedError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        }
    };

    return <RoleMapping name={name} id={id} type="users" save={assignRoles} />;
};
