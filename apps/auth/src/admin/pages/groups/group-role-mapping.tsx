import { useTranslation } from "@merge-rd/i18n";
import { toast } from "sonner";
import { getErrorDescription, getErrorMessage } from "@/shared/keycloak-ui-shared";
import { RoleMapping, type Row } from "@/admin/shared/ui/role-mapping/role-mapping";
import { useAssignGroupRoles } from "./hooks/use-assign-group-roles";

type GroupRoleMappingProps = {
    id: string;
    name: string;
    canManageGroup: boolean;
};

export const GroupRoleMapping = ({ id, name, canManageGroup }: GroupRoleMappingProps) => {

    const { t } = useTranslation();
    const { mutateAsync: assignRolesMutation } = useAssignGroupRoles(id);

    const assignRoles = async (rows: Row[]) => {
        try {
            await assignRolesMutation(rows);
            toast.success(t("roleMappingUpdatedSuccess"));
        } catch (error) {
            toast.error(t("roleMappingUpdatedError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        }
    };

    return (
        <RoleMapping
            isManager={canManageGroup}
            name={name}
            id={id}
            type="groups"
            save={assignRoles}
        />
    );
};
