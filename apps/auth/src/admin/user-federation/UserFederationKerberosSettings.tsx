import type ComponentRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentRepresentation";
import {
    getErrorDescription,
    getErrorMessage,
} from "../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { Button } from "@merge/ui/components/button";
import { FormProvider, useForm } from "react-hook-form";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAdminClient } from "../admin-client";
import { FormAccess } from "../components/form/FormAccess";
import { FixedButtonsGroup } from "../components/form/FixedButtonGroup";
import {
    FormPanel,
    KeycloakSpinner,
} from "../../shared/keycloak-ui-shared";
import { useRealm } from "../context/realm-context/RealmContext";
import { useParams } from "../utils/useParams";
import { KerberosSettingsRequired } from "./kerberos/KerberosSettingsRequired";
import { toUserFederation } from "./routes/UserFederation";
import { Header } from "./shared/Header";
import { SettingsCache } from "./shared/SettingsCache";

export default function UserFederationKerberosSettings() {
    const { adminClient } = useAdminClient();
    const { t } = useTranslation();
    const form = useForm<ComponentRepresentation>({ mode: "onChange" });
    const navigate = useNavigate();
    const { realm } = useRealm();
    const { id } = useParams<{ id?: string }>();
    const [loading, setLoading] = useState(!!id);

    const setupForm = useCallback((component: ComponentRepresentation) => {
        form.reset({ ...component });
    }, [form]);

    useEffect(() => {
        if (!id) {
            setLoading(false);
            return;
        }
        let cancelled = false;
        adminClient.components
            .findOne({ id })
            .then((data) => {
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
                navigate(`/${realm}/user-federation`);
            } else {
                await adminClient.components.update({ id }, component);
            }
            setupForm(component as ComponentRepresentation);
            toast.success(
                t(!id ? "createUserProviderSuccess" : "userProviderSaveSuccess"),
            );
        } catch (error) {
            toast.error(
                t(!id ? "createUserProviderError" : "userProviderSaveError", {
                    error: getErrorMessage(error),
                }),
                { description: getErrorDescription(error) },
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
                    <FormPanel
                        title={t("requiredSettings")}
                        className="space-y-4"
                    >
                        <div className="space-y-6">
                            <KerberosSettingsRequired
                                form={form}
                                showSectionHeading={false}
                            />
                        </div>
                    </FormPanel>
                    <FormPanel title={t("cacheSettings")} className="space-y-4">
                        <div className="space-y-6">
                            <SettingsCache
                                form={form}
                                showSectionHeading={false}
                            />
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
                                navigate(toUserFederation({ realm }))
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
