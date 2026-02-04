import type ResourceServerRepresentation from "@keycloak/keycloak-admin-client/lib/defs/resourceServerRepresentation";
import { getErrorDescription, getErrorMessage, HelpItem, useFetch } from "../../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { Button } from "@merge/ui/components/button";
import { Separator } from "@merge/ui/components/separator";
import { Label } from "@merge/ui/components/label";
import { RadioGroup, RadioGroupItem } from "@merge/ui/components/radio-group";
import { useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../../admin-client";
import { FixedButtonsGroup } from "../../components/form/FixedButtonGroup";
import { FormAccess } from "../../components/form/FormAccess";
import { KeycloakSpinner } from "../../../shared/keycloak-ui-shared";
import { DefaultSwitchControl } from "../../components/SwitchControl";
import { useAccess } from "../../context/access/Access";
import useToggle from "../../utils/useToggle";
import { DecisionStrategySelect } from "./DecisionStrategySelect";
import { ImportDialog } from "./ImportDialog";

const POLICY_ENFORCEMENT_MODES = ["ENFORCING", "PERMISSIVE", "DISABLED"] as const;

export type FormFields = Omit<ResourceServerRepresentation, "scopes" | "resources">;

export const AuthorizationSettings = ({ clientId }: { clientId: string }) => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const [resource, setResource] = useState<ResourceServerRepresentation>();
    const [importDialog, toggleImportDialog] = useToggle();

    const form = useForm<FormFields>({});
    const { control, reset, handleSubmit } = form;
const { hasAccess } = useAccess();

    const isDisabled = !hasAccess("manage-authorization");

    useFetch(
        () => adminClient.clients.getResourceServer({ id: clientId }),
        resource => {
            setResource(resource);
            reset(resource);
        },
        []
    );

    const importResource = async (value: ResourceServerRepresentation) => {
        try {
            await adminClient.clients.importResource({ id: clientId }, value);
            toast.success(t("importResourceSuccess"));
            reset({ ...value });
        } catch (error) {
            toast.error(t("importResourceError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    const onSubmit = async (resource: ResourceServerRepresentation) => {
        try {
            await adminClient.clients.updateResourceServer({ id: clientId }, resource);
            toast.success(t("updateResourceSuccess"));
        } catch (error) {
            toast.error(t("resourceSaveError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
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
                                    <div key={mode} className="flex items-center gap-2" data-testid={mode}>
                                        <RadioGroupItem value={mode} id={mode} />
                                        <Label htmlFor={mode}>{t(`policyEnforcementModes.${mode}`)}</Label>
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
