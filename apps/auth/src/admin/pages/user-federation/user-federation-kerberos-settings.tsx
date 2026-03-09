import type ComponentRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Button } from "@merge-rd/ui/components/button";
import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
    FormPanel,
    getErrorDescription,
    getErrorMessage,
    KeycloakSpinner
} from "@/shared/keycloak-ui-shared";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import { toUserFederation } from "@/admin/shared/lib/routes/user-federation";
import { useParams } from "@/admin/shared/lib/use-params";
import { FixedButtonsGroup } from "@/admin/shared/ui/form/fixed-button-group";
import { FormAccess } from "@/admin/shared/ui/form/form-access";
import { KerberosSettingsRequired } from "./kerberos/kerberos-settings-required";
import { useComponentDetail } from "./hooks/use-component-detail";
import { useCreateComponent } from "./hooks/use-create-component";
import { useUpdateComponent } from "./hooks/use-update-component";
import { Header } from "./shared/header";
import { SettingsCache } from "./shared/settings-cache";

export function UserFederationKerberosSettings() {
    const { t } = useTranslation();
    const form = useForm<ComponentRepresentation>({ mode: "onChange" });
    const navigate = useNavigate();
    const { realm } = useRealm();
    const { id } = useParams<{ id?: string }>();

    const { data: fetchedComponent, isLoading } = useComponentDetail(id);
    const { mutateAsync: createComponentMut } = useCreateComponent();
    const { mutateAsync: updateComponentMut } = useUpdateComponent();

    const setupForm = useCallback(
        (component: ComponentRepresentation) => {
            form.reset({ ...component });
        },
        [form]
    );

    useEffect(() => {
        if (fetchedComponent) {
            setupForm(fetchedComponent);
        }
    }, [fetchedComponent, setupForm]);

    const save = async (component: ComponentRepresentation) => {
        try {
            if (!id) {
                await createComponentMut(component);
                navigate({ to: `/${realm}/user-federation` as string });
            } else {
                await updateComponentMut({ id, component });
            }
            setupForm(component as ComponentRepresentation);
            toast.success(
                t(!id ? "createUserProviderSuccess" : "userProviderSaveSuccess")
            );
        } catch (error) {
            toast.error(
                t(!id ? "createUserProviderError" : "userProviderSaveError", {
                    error: getErrorMessage(error)
                }),
                { description: getErrorDescription(error) }
            );
        }
    };

    if (isLoading) {
        return <KeycloakSpinner />;
    }

    return (
        <FormProvider {...form}>
            <Header provider="Kerberos" save={() => form.handleSubmit(save)()} />
            <div className="space-y-6 py-6">
                <FormAccess
                    role="manage-realm"
                    isHorizontal
                    className="space-y-6"
                    onSubmit={form.handleSubmit(save)}
                >
                    <FormPanel title={t("requiredSettings")} className="space-y-4">
                        <div className="space-y-6">
                            <KerberosSettingsRequired
                                form={form}
                                showSectionHeading={false}
                            />
                        </div>
                    </FormPanel>
                    <FormPanel title={t("cacheSettings")} className="space-y-4">
                        <div className="space-y-6">
                            <SettingsCache form={form} showSectionHeading={false} />
                        </div>
                    </FormPanel>
                    <FixedButtonsGroup
                        name="kerberos"
                        isSubmit
                        isDisabled={!form.formState.isDirty}
                    >
                        <Button
                            type="button"
                            variant="ghost"
                            data-testid="kerberos-cancel"
                            onClick={() =>
                                navigate({ to: toUserFederation({ realm }) as string })
                            }
                        >
                            {t("cancel")}
                        </Button>
                    </FixedButtonsGroup>
                </FormAccess>
            </div>
        </FormProvider>
    );
}
