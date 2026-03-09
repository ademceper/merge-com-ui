import { useTranslation } from "@merge-rd/i18n";
import { useNavigate } from "@tanstack/react-router";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { getErrorDescription, getErrorMessage } from "@/shared/keycloak-ui-shared";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import { toUserFederation } from "@/admin/shared/lib/routes/user-federation";
import { useCreateComponent } from "./hooks/use-create-component";
import { ExtendedHeader } from "./shared/extended-header";
import {
    type LdapComponentRepresentation,
    serializeFormData,
    UserFederationLdapForm
} from "./user-federation-ldap-form";

export function CreateUserFederationLdapSettings() {

    const { t } = useTranslation();
    const form = useForm<LdapComponentRepresentation>({ mode: "onChange" });
    const navigate = useNavigate();
    const { realm } = useRealm();
    const { mutateAsync: createComponentMut } = useCreateComponent();
    const onSubmit = async (formData: LdapComponentRepresentation) => {
        try {
            await createComponentMut(serializeFormData(formData));
            toast.success(t("createUserProviderSuccess"));
            navigate({ to: toUserFederation({ realm }) as string });
        } catch (error) {
            toast.error(t("createUserProviderError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
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
