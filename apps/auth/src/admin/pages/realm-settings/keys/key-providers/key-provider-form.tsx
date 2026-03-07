import type ComponentRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentRepresentation";
import { getErrorDescription, getErrorMessage, TextControl, useFetch } from "../../../../../shared/keycloak-ui-shared";
import { toast } from "sonner";
import { Button } from "@merge-rd/ui/components/button";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "@merge-rd/i18n";
import { useNavigate } from "@tanstack/react-router";
import { useAdminClient } from "../../../../app/admin-client";
import { DynamicComponents } from "../../../../shared/ui/dynamic/dynamic-components";
import { FormAccess } from "../../../../shared/ui/form/form-access";
import { useServerInfo } from "../../../../app/providers/server-info/server-info-provider";
import { KEY_PROVIDER_TYPE } from "../../../../shared/lib/util";
import { useParams } from "../../../../shared/lib/useParams";
import { KeyProviderParams, ProviderType } from "../../routes/key-provider";
import { toKeysTab } from "../../routes/keys-tab";

type KeyProviderFormProps = {
    id?: string;
    providerType: ProviderType;
    onClose?: () => void;
};

export const KeyProviderForm = ({ providerType, onClose }: KeyProviderFormProps) => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
const serverInfo = useServerInfo();
    const allComponentTypes = serverInfo.componentTypes?.[KEY_PROVIDER_TYPE] ?? [];

    const form = useForm<ComponentRepresentation>({
        mode: "onChange"
    });
    const { handleSubmit, reset } = form;

    const save = async (component: ComponentRepresentation) => {
        if (component.config)
            Object.entries(component.config).forEach(
                ([key, value]) =>
                    (component.config![key] = Array.isArray(value) ? value : [value])
            );
        try {
            if (id) {
                await adminClient.components.update(
                    { id },
                    {
                        ...component,
                        providerType: KEY_PROVIDER_TYPE
                    }
                );
                toast.success(t("saveProviderSuccess"));
            } else {
                await adminClient.components.create({
                    ...component,
                    providerId: providerType,
                    providerType: KEY_PROVIDER_TYPE
                });
                toast.success(t("saveProviderSuccess"));
                onClose?.();
            }
        } catch (error) {
            toast.error(t("saveProviderError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    useFetch(
        async () => {
            if (id) return await adminClient.components.findOne({ id });
        },
        result => {
            if (result) {
                reset({ ...result });
            }
        },
        []
    );

    return (
        <FormAccess isHorizontal role="manage-realm" onSubmit={handleSubmit(save)}>
            <FormProvider {...form}>
                {id && (
                    <TextControl
                        name="id"
                        label={t("providerId")}
                        labelIcon={t("providerIdHelp")}
                        rules={{
                            required: t("required")
                        }}
                        readOnly
                    />
                )}
                <TextControl
                    name="name"
                    defaultValue={providerType}
                    label={t("name")}
                    labelIcon={t("keyProviderMapperNameHelp")}
                    rules={{
                        required: t("required")
                    }}
                />
                <DynamicComponents
                    properties={
                        allComponentTypes.find(type => type.id === providerType)
                            ?.properties || []
                    }
                />
                <div className="flex gap-2">
                    <Button
                        data-testid="add-provider-button"
                        type="submit"
                    >
                        {t("save")}
                    </Button>
                    <Button onClick={() => onClose?.()} variant="ghost">
                        {t("cancel")}
                    </Button>
                </div>
            </FormProvider>
        </FormAccess>
    );
};

export default function KeyProviderFormPage() {
    const { t } = useTranslation();
    const params = useParams<KeyProviderParams>();
    const navigate = useNavigate();

    return (
        <>
                        <div className="p-6">
                <KeyProviderForm
                    {...params}
                    onClose={() =>
                        navigate({ to: toKeysTab({ realm: params.realm, tab: "providers" }) as string })
                    }
                />
            </div>
        </>
    );
}
