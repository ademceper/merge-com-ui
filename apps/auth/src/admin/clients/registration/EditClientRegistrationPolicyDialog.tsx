import type ComponentRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentRepresentation";
import { getErrorDescription, getErrorMessage, TextControl } from "../../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { Button } from "@merge/ui/components/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@merge/ui/components/dialog";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState } from "react";
import { useAdminClient } from "../../admin-client";
import { DynamicComponents } from "../../components/dynamic/DynamicComponents";
import { FormAccess } from "../../components/form/FormAccess";
import { useRealm } from "../../context/realm-context/RealmContext";
import { useServerInfo } from "../../context/server-info/ServerInfoProvider";

const POLICY_TYPE = "org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy";

type EditClientRegistrationPolicyDialogProps = {
    policy: ComponentRepresentation | null;
    subTab: "anonymous" | "authenticated";
    onClose: () => void;
    onSuccess: () => void;
};

export function EditClientRegistrationPolicyDialog({
    policy,
    subTab,
    onClose,
    onSuccess,
}: EditClientRegistrationPolicyDialogProps) {
    const { adminClient } = useAdminClient();
    const { t } = useTranslation();
    const { realmRepresentation } = useRealm();
    const serverInfo = useServerInfo();
    const [saving, setSaving] = useState(false);

    const provider = useMemo(() => {
        if (!policy?.providerId) return null;
        const descriptions = serverInfo.componentTypes?.[POLICY_TYPE];
        return descriptions?.find((p) => p.id === policy.providerId) ?? null;
    }, [policy?.providerId, serverInfo.componentTypes]);

    const form = useForm<ComponentRepresentation>({
        defaultValues: policy ?? { providerId: "", name: "" },
    });
    const { handleSubmit, reset } = form;

    useEffect(() => {
        if (policy) reset(policy);
    }, [policy, reset]);

    const onSubmit = async (component: ComponentRepresentation) => {
        if (!policy?.id || !policy.providerId) return;
        if (component.config) {
            Object.entries(component.config).forEach(
                ([key, value]) =>
                    (component.config![key] = Array.isArray(value) ? value : [value])
            );
        }
        setSaving(true);
        try {
            const updatedComponent = {
                ...component,
                subType: subTab,
                parentId: realmRepresentation?.id,
                providerType: POLICY_TYPE,
                providerId: policy.providerId,
            };
            await adminClient.components.update({ id: policy.id }, updatedComponent);
            toast.success(t("providerUpdatedSuccess"));
            onClose();
            onSuccess();
        } catch (error) {
            toast.error(
                t("providerUpdatedError", { error: getErrorMessage(error) }),
                { description: getErrorDescription(error) }
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <Dialog open={!!policy} onOpenChange={(open) => !open && onClose()}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{policy?.name || t("createPolicy")}</DialogTitle>
                    </DialogHeader>
                    {policy && provider ? (
                        <FormProvider {...form}>
                            <FormAccess
                                id="edit-client-registration-policy-form"
                                role="manage-clients"
                                isHorizontal
                                onSubmit={handleSubmit(onSubmit)}
                            >
                                <div className="min-h-[200px] flex flex-col gap-4">
                                    <TextControl name="providerId" label={t("provider")} readOnly />
                                    <TextControl
                                        name="name"
                                        label={t("name")}
                                        labelIcon={t("clientPolicyNameHelp")}
                                        rules={{ required: t("required") }}
                                    />
                                    <DynamicComponents
                                        properties={provider.properties!}
                                        layoutOverridesByType={{
                                            List: { hideLabel: true, helpIconAfterControl: true },
                                            MultivaluedList: { hideLabel: true, helpIconAfterControl: true },
                                            MultivaluedString: { hideLabel: true, helpIconAfterControl: true },
                                            boolean: { booleanLabelTextSwitchHelp: true },
                                        }}
                                    />
                                </div>
                            </FormAccess>
                        </FormProvider>
                    ) : null}
                    {policy && (
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={onClose}>
                                {t("cancel")}
                            </Button>
                            <Button
                                type="submit"
                                form="edit-client-registration-policy-form"
                                data-testid="save"
                                disabled={saving}
                            >
                                {t("save")}
                            </Button>
                        </DialogFooter>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
