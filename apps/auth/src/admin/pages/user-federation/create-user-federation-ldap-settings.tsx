import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAdminClient } from "../../app/admin-client";
import { getErrorDescription, getErrorMessage } from "../../../shared/keycloak-ui-shared";
import { toast } from "sonner";
import { useRealm } from "../../app/providers/realm-context/realm-context";
import {
    LdapComponentRepresentation,
    UserFederationLdapForm,
    serializeFormData
} from "./user-federation-ldap-form";
import { toUserFederation } from "./routes/user-federation";
import { ExtendedHeader } from "./shared/extended-header";

export default function CreateUserFederationLdapSettings() {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const form = useForm<LdapComponentRepresentation>({ mode: "onChange" });
    const navigate = useNavigate();
    const { realm } = useRealm();
const onSubmit = async (formData: LdapComponentRepresentation) => {
        try {
            await adminClient.components.create(serializeFormData(formData));
            toast.success(t("createUserProviderSuccess"));
            navigate(toUserFederation({ realm }));
        } catch (error) {
            toast.error(t("createUserProviderError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    return (
        <FormProvider {...form}>
            <ExtendedHeader
                provider="LDAP"
                noDivider
                save={() => form.handleSubmit(onSubmit)()}
            />
<div className="space-y-6 py-6">
                <div className="rounded-lg bg-muted/30 p-6">
                    <UserFederationLdapForm onSubmit={onSubmit} />
                </div>
            </div>
        </FormProvider>
    );
}
