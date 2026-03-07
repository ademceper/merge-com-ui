import type RoleRepresentation from "@keycloak/keycloak-admin-client/lib/defs/roleRepresentation";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "@merge-rd/i18n";
import { useNavigate } from "@tanstack/react-router";
import { useAdminClient } from "../../app/admin-client";
import { getErrorDescription, getErrorMessage } from "../../../shared/keycloak-ui-shared";
import { toast } from "sonner";
import { AttributeForm } from "../../shared/ui/key-value-form/attribute-form";
import { RoleForm } from "../../shared/ui/role-form/role-form";
import { useRealm } from "../../app/providers/realm-context/realm-context";
import { toRealmRole } from "./routes/realm-role";
import { toRealmRoles } from "./routes/realm-roles";

export default function CreateRealmRole() {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const form = useForm<AttributeForm>({ mode: "onChange" });
    const navigate = useNavigate();
    const { realm } = useRealm();
const onSubmit: SubmitHandler<AttributeForm> = async formValues => {
        const role: RoleRepresentation = {
            ...formValues,
            name: formValues.name?.trim(),
            attributes: {}
        };

        try {
            await adminClient.roles.create(role);

            const createdRole = await adminClient.roles.findOneByName({
                name: formValues.name!
            });

            if (!createdRole) {
                throw new Error(t("notFound"));
            }

            toast.success(t("roleCreated"));
            navigate({ to: toRealmRole({ realm, id: createdRole.id!, tab: "details" }) as string });
        } catch (error) {
            toast.error(t("roleCreateError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
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
