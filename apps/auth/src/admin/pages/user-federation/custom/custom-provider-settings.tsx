import type ComponentRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Button } from "@merge-rd/ui/components/button";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
    getErrorDescription,
    getErrorMessage,
    KeycloakSpinner,
    TextControl
} from "../../../../shared/keycloak-ui-shared";
import { useAdminClient } from "../../../app/admin-client";
import { useRealm } from "../../../app/providers/realm-context/realm-context";
import { useServerInfo } from "../../../app/providers/server-info/server-info-provider";
import { useParams } from "../../../shared/lib/useParams";
import { convertFormValuesToObject, convertToFormValues } from "../../../shared/lib/util";
import { DynamicComponents } from "../../../shared/ui/dynamic/dynamic-components";
import { FormAccess } from "../../../shared/ui/form/form-access";
import { useCustomComponent } from "../api/use-custom-component";
import type { CustomUserFederationRouteParams } from "../../../shared/lib/routes/user-federation";
import { toUserFederation } from "../../../shared/lib/routes/user-federation";
import { ExtendedHeader } from "../shared/extended-header";
import { SettingsCache } from "../shared/settings-cache";
import { SyncSettings } from "./sync-settings";

export default function CustomProviderSettings() {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const { id, providerId } = useParams<CustomUserFederationRouteParams>();
    const navigate = useNavigate();
    const form = useForm<ComponentRepresentation>({
        mode: "onChange"
    });
    const {
        reset,
        setValue,
        handleSubmit,
        formState: { isDirty }
    } = form;
    const { realm: realmName, realmRepresentation: realm } = useRealm();

    const provider = (
        useServerInfo().componentTypes?.["org.keycloak.storage.UserStorageProvider"] || []
    ).find(p => p.id === providerId);

    const { data: fetchedComponent, isLoading } = useCustomComponent(id);

    useEffect(() => {
        if (fetchedComponent) {
            convertToFormValues(fetchedComponent, setValue);
        } else if (id && !isLoading) {
            throw new Error(t("notFound"));
        }
    }, [fetchedComponent, isLoading]);

    const save = async (component: ComponentRepresentation) => {
        const saveComponent = convertFormValuesToObject({
            ...component,
            config: Object.fromEntries(
                Object.entries(component.config || {}).map(([key, value]) => [
                    key,
                    Array.isArray(value) ? value : [value]
                ])
            ),
            providerId,
            providerType: "org.keycloak.storage.UserStorageProvider",
            parentId: realm?.id
        });

        try {
            if (!id) {
                await adminClient.components.create(saveComponent);
                navigate({ to: toUserFederation({ realm: realmName }) as string });
            } else {
                await adminClient.components.update({ id }, saveComponent);
            }
            reset({ ...component });
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

    if (isLoading) return <KeycloakSpinner />;

    return (
        <FormProvider {...form}>
            <ExtendedHeader provider={providerId} save={() => handleSubmit(save)()} />
            <div className="bg-muted/30 p-4">
                <FormAccess
                    role="manage-realm"
                    isHorizontal
                    className="keycloak__user-federation__custom-form"
                    onSubmit={handleSubmit(save)}
                >
                    <TextControl
                        name="name"
                        label={t("uiDisplayName")}
                        labelIcon={t("uiDisplayNameHelp")}
                        rules={{
                            required: t("validateName")
                        }}
                    />
                    <DynamicComponents properties={provider?.properties || []} />
                    {provider?.metadata.synchronizable && <SyncSettings />}
                    <SettingsCache form={form} unWrap />
                    <div className="flex gap-2">
                        <Button
                            disabled={!isDirty}
                            type="submit"
                            data-testid="custom-save"
                        >
                            {t("save")}
                        </Button>
                        <Button variant="link" asChild data-testid="custom-cancel">
                            <Link to={toUserFederation({ realm: realmName }) as string}>
                                {t("cancel")}
                            </Link>
                        </Button>
                    </div>
                </FormAccess>
            </div>
        </FormProvider>
    );
}
