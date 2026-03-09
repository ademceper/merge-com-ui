import type RoleRepresentation from "@keycloak/keycloak-admin-client/lib/defs/roleRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { useNavigate } from "@tanstack/react-router";
import { FormProvider, type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { getErrorDescription, getErrorMessage } from "@/shared/keycloak-ui-shared";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import { useCreateRealmRole } from "./hooks/use-create-realm-role";
import { toRealmRole, toRealmRoles } from "@/admin/shared/lib/routes/realm-roles";
import type { AttributeForm } from "@/admin/shared/ui/key-value-form/attribute-form";
import { RoleForm } from "@/admin/shared/ui/role-form/role-form";

export function CreateRealmRole() {

    const { t } = useTranslation();
    const form = useForm<AttributeForm>({ mode: "onChange" });
    const navigate = useNavigate();
    const { realm } = useRealm();
    const { mutateAsync: createRole } = useCreateRealmRole();

    const onSubmit: SubmitHandler<AttributeForm> = async formValues => {
        const role: RoleRepresentation = {
            ...formValues,
            name: formValues.name?.trim(),
            attributes: {}
        };

        try {
            const createdRole = await createRole(role);

            toast.success(t("roleCreated"));
            navigate({
                to: toRealmRole({ realm, id: createdRole.id!, tab: "details" }) as string
            });
        } catch (error) {
            toast.error(t("roleCreateError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        }
    };

    return (
        <FormProvider {...form}>
            <RoleForm
                form={form}
                onSubmit={onSubmit}
                cancelLink={toRealmRoles({ realm })}
                role="manage-realm"
                editMode={false}
            />
        </FormProvider>
    );
}
