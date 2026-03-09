import type RoleRepresentation from "@keycloak/keycloak-admin-client/lib/defs/roleRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { useNavigate, useParams } from "@tanstack/react-router";
import { FormProvider, type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
    getErrorDescription,
    getErrorMessage
} from "@/shared/keycloak-ui-shared";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import { useCreateClientRole } from "../hooks/use-client-roles";
import type { NewRoleParams } from "@/admin/shared/lib/routes/clients";
import { toClient, toClientRole } from "@/admin/shared/lib/routes/clients";
import type { AttributeForm } from "@/admin/shared/ui/key-value-form/attribute-form";
import { RoleForm } from "@/admin/shared/ui/role-form/role-form";

export function CreateClientRole() {

    const { t } = useTranslation();
    const form = useForm<AttributeForm>({ mode: "onChange" });
    const navigate = useNavigate();
    const { clientId } = useParams({ strict: false }) as NewRoleParams;
    const { realm } = useRealm();
    const { mutateAsync: createClientRole } = useCreateClientRole();
    const onSubmit: SubmitHandler<AttributeForm> = async formValues => {
        const role: RoleRepresentation = {
            ...formValues,
            name: formValues.name?.trim(),
            attributes: {}
        };

        try {
            const createdRole = (await createClientRole({
                clientId: clientId!,
                role
            }))!;

            toast.success(t("roleCreated"));
            navigate({
                to: toClientRole({
                    realm,
                    clientId: clientId!,
                    id: createdRole.id!,
                    tab: "details"
                }) as string
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
                cancelLink={toClient({
                    realm,
                    clientId: clientId!,
                    tab: "roles"
                })}
                role="manage-clients"
                editMode={false}
            />
        </FormProvider>
    );
}
