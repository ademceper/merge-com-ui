import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAdminClient } from "../admin-client";
import { getErrorDescription, getErrorMessage } from "../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { useRealm } from "../context/realm-context/RealmContext";
import {
    LdapComponentRepresentation,
    UserFederationLdapForm,
    serializeFormData
} from "./UserFederationLdapForm";
import { toUserFederation } from "./routes/UserFederation";
import { ExtendedHeader } from "./shared/ExtendedHeader";

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
