import type ResourceServerRepresentation from "@keycloak/keycloak-admin-client/lib/defs/resourceServerRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Button } from "@merge-rd/ui/components/button";
import { Label } from "@merge-rd/ui/components/label";
import { RadioGroup, RadioGroupItem } from "@merge-rd/ui/components/radio-group";
import { Separator } from "@merge-rd/ui/components/separator";
import { useEffect, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
    getErrorDescription,
    getErrorMessage,
    HelpItem,
    KeycloakSpinner
} from "@/shared/keycloak-ui-shared";
import { useAccess } from "@/admin/app/providers/access/access";
import { useImportResource, useUpdateResourceServer } from "./hooks/use-authorization-mutations";
import { useToggle } from "@/admin/shared/lib/use-toggle";
import { FixedButtonsGroup } from "@/admin/shared/ui/form/fixed-button-group";
import { FormAccess } from "@/admin/shared/ui/form/form-access";
import { DefaultSwitchControl } from "@/admin/shared/ui/switch-control";
import { useResourceServer } from "./hooks/use-resource-server";
import { DecisionStrategySelect } from "./decision-strategy-select";
import { ImportDialog } from "./import-dialog";

const POLICY_ENFORCEMENT_MODES = ["ENFORCING", "PERMISSIVE", "DISABLED"] as const;

type FormFields = Omit<ResourceServerRepresentation, "scopes" | "resources">;

export const AuthorizationSettings = ({ clientId }: { clientId: string }) => {

    const { t } = useTranslation();
    const { mutateAsync: importResourceMutation } = useImportResource();
    const { mutateAsync: updateResourceServerMutation } = useUpdateResourceServer();
    const [resource, setResource] = useState<ResourceServerRepresentation>();
    const [importDialog, toggleImportDialog] = useToggle();

    const form = useForm<FormFields>({});
    const { control, reset, handleSubmit } = form;
    const { hasAccess } = useAccess();

    const isDisabled = !hasAccess("manage-authorization");

    const { data: resourceServerData } = useResourceServer(clientId);

    useEffect(() => {
        if (resourceServerData) {
            setResource(resourceServerData);
            reset(resourceServerData);
        }
    }, [resourceServerData]);

    const importResource = async (value: ResourceServerRepresentation) => {
        try {
            await importResourceMutation({ clientId, value });
            toast.success(t("importResourceSuccess"));
            reset({ ...value });
        } catch (error) {
            toast.error(t("importResourceError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        }
    };

    const onSubmit = async (resource: ResourceServerRepresentation) => {
        try {
            await updateResourceServerMutation({ clientId, resource });
            toast.success(t("updateResourceSuccess"));
        } catch (error) {
            toast.error(t("resourceSaveError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        }
    };

    if (!resource) {
        return <KeycloakSpinner />;
    }

    return (
        <div className="p-6">
            {importDialog && (
                <ImportDialog
                    onConfirm={importResource}
                    closeDialog={toggleImportDialog}
                />
            )}
            <FormAccess
                role="manage-authorization"
                isHorizontal
                onSubmit={handleSubmit(onSubmit)}
            >
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Label>{t("import")}</Label>
                        <HelpItem helpText={t("importHelp")} fieldLabelId="import" />
                    </div>
                    <Button variant="secondary" onClick={toggleImportDialog}>
                        {t("import")}
                    </Button>
                </div>
                <Separator />
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Label>{t("policyEnforcementMode")}</Label>
                        <HelpItem
                            helpText={t("policyEnforcementModeHelp")}
                            fieldLabelId="policyEnforcementMode"
                        />
                    </div>
                    <Controller
                        name="policyEnforcementMode"
                        data-testid="policyEnforcementMode"
                        defaultValue={POLICY_ENFORCEMENT_MODES[0]}
                        control={control}
                        render={({ field }) => (
                            <RadioGroup
                                value={field.value}
                                onValueChange={field.onChange}
                                disabled={isDisabled}
                                className="flex flex-col gap-2"
                            >
                                {POLICY_ENFORCEMENT_MODES.map(mode => (
                                    <div
                                        key={mode}
                                        className="flex items-center gap-2"
                                        data-testid={mode}
                                    >
                                        <RadioGroupItem value={mode} id={mode} />
                                        <Label htmlFor={mode}>
                                            {t(`policyEnforcementModes.${mode}`)}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        )}
                    />
                </div>
                <FormProvider {...form}>
                    <DecisionStrategySelect isLimited />
                    <DefaultSwitchControl
                        name="allowRemoteResourceManagement"
                        label={t("allowRemoteResourceManagement")}
                        labelIcon={t("allowRemoteResourceManagementHelp")}
                    />
                </FormProvider>
                <FixedButtonsGroup
                    name="authenticationSettings"
                    reset={() => reset(resource)}
                    isSubmit
                />
            </FormAccess>
        </div>
    );
};
