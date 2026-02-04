import type ComponentRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentRepresentation";
import { getErrorDescription, getErrorMessage, KeycloakSpinner,
    TextControl,
    useFetch } from "../../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { Button } from "@merge/ui/components/button";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useAdminClient } from "../../admin-client";
import { DynamicComponents } from "../../components/dynamic/DynamicComponents";
import { FormAccess } from "../../components/form/FormAccess";
import { useRealm } from "../../context/realm-context/RealmContext";
import { useServerInfo } from "../../context/server-info/ServerInfoProvider";
import { convertFormValuesToObject, convertToFormValues } from "../../util";
import { useParams } from "../../utils/useParams";
import type { CustomUserFederationRouteParams } from "../routes/CustomUserFederation";
import { toUserFederation } from "../routes/UserFederation";
import { ExtendedHeader } from "../shared/ExtendedHeader";
import { SettingsCache } from "../shared/SettingsCache";
import { SyncSettings } from "./SyncSettings";

import { useState } from "react";

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
    const [loading, setLoading] = useState(true);

    const provider = (
        useServerInfo().componentTypes?.["org.keycloak.storage.UserStorageProvider"] || []
    ).find(p => p.id === providerId);

    useFetch(
        async () => {
            if (id) {
                return await adminClient.components.findOne({ id });
            }
            return undefined;
        },
        fetchedComponent => {
            if (fetchedComponent) {
                convertToFormValues(fetchedComponent, setValue);
            } else if (id) {
                throw new Error(t("notFound"));
            }
            setLoading(false);
        },
        []
    );

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
                navigate(toUserFederation({ realm: realmName }));
            } else {
                await adminClient.components.update({ id }, saveComponent);
            }
            reset({ ...component });
            toast.success(t(!id ? "createUserProviderSuccess" : "userProviderSaveSuccess"));
        } catch (error) {
            toast.error(t(!id ? "createUserProviderError" : "userProviderSaveError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    if (loading) return <KeycloakSpinner />;

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
                        <Button
                            variant="link"
                            asChild
                            data-testid="custom-cancel"
                        >
                            <Link to={toUserFederation({ realm: realmName })}>
                                {t("cancel")}
                            </Link>
                        </Button>
                    </div>
                </FormAccess>
            </div>
        </FormProvider>
    );
}
