import type RoleRepresentation from "@keycloak/keycloak-admin-client/lib/defs/roleRepresentation";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAdminClient } from "../admin-client";
import { getErrorDescription, getErrorMessage } from "../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { AttributeForm } from "../components/key-value-form/AttributeForm";
import { RoleForm } from "../components/role-form/RoleForm";
import { useRealm } from "../context/realm-context/RealmContext";
import { toRealmRole } from "./routes/RealmRole";
import { toRealmRoles } from "./routes/RealmRoles";

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
            navigate(toRealmRole({ realm, id: createdRole.id!, tab: "details" }));
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
