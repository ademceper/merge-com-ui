import type ComponentRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Button } from "@merge-rd/ui/components/button";
import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
    FormPanel,
    getErrorDescription,
    getErrorMessage,
    KeycloakSpinner
} from "../../../shared/keycloak-ui-shared";
import { useAdminClient } from "../../app/admin-client";
import { useRealm } from "../../app/providers/realm-context/realm-context";
import { useParams } from "../../shared/lib/useParams";
import { FixedButtonsGroup } from "../../shared/ui/form/fixed-button-group";
import { FormAccess } from "../../shared/ui/form/form-access";
import { KerberosSettingsRequired } from "./kerberos/kerberos-settings-required";
import { toUserFederation } from "../../shared/lib/routes/user-federation";
import { Header } from "./shared/header";
import { SettingsCache } from "./shared/settings-cache";

export default function UserFederationKerberosSettings() {
    const { adminClient } = useAdminClient();
    const { t } = useTranslation();
    const form = useForm<ComponentRepresentation>({ mode: "onChange" });
    const navigate = useNavigate();
    const { realm } = useRealm();
    const { id } = useParams<{ id?: string }>();
    const [loading, setLoading] = useState(!!id);

    const setupForm = useCallback(
        (component: ComponentRepresentation) => {
            form.reset({ ...component });
        },
        [form]
    );

    useEffect(() => {
        if (!id) {
            setLoading(false);
            return;
        }
        let cancelled = false;
        adminClient.components
            .findOne({ id })
            .then(data => {
                if (!cancelled && data) setupForm(data);
            })
            .catch(() => {
                if (!cancelled) setLoading(false);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [id, adminClient, setupForm]);

    const save = async (component: ComponentRepresentation) => {
        try {
            if (!id) {
                await adminClient.components.create(component);
                navigate({ to: `/${realm}/user-federation` as string });
            } else {
                await adminClient.components.update({ id }, component);
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

    if (loading) {
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
