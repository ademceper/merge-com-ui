import type AuthenticatorConfigRepresentation from "@keycloak/keycloak-admin-client/lib/defs/authenticatorConfigRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Button } from "@merge-rd/ui/components/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@merge-rd/ui/components/dialog";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from "@merge-rd/ui/components/tooltip";
import { Gear, Trash } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
    getErrorDescription,
    getErrorMessage,
    TextControl
} from "../../../../shared/keycloak-ui-shared";
import { useAdminClient } from "../../../app/admin-client";
import { convertFormValuesToObject, convertToFormValues } from "../../../shared/lib/util";
import { DynamicComponents } from "../../../shared/ui/dynamic/dynamic-components";
import { useExecutionConfig } from "../api/use-execution-config";
import type { ExpandableExecution } from "../execution-model";

type ExecutionConfigModalForm = {
    alias: string;
    config: { [index: string]: string };
};

type ExecutionConfigModalProps = {
    execution: ExpandableExecution;
};

export const ExecutionConfigModal = ({ execution }: ExecutionConfigModalProps) => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const [show, setShow] = useState(false);
    const [config, setConfig] = useState<AuthenticatorConfigRepresentation>();

    const form = useForm<ExecutionConfigModalForm>();
    const { setValue, handleSubmit } = form;

    // default config all executions should have
    const defaultConfigProperties = execution.authenticationFlow
        ? []
        : [
              {
                  helpText: t("authenticatorRefConfig.value.help"),
                  label: t("authenticatorRefConfig.value.label"),
                  name: "default.reference.value",
                  readOnly: false,
                  secret: false,
                  type: "String"
              },
              {
                  helpText: t("authenticatorRefConfig.maxAge.help"),
                  label: t("authenticatorRefConfig.maxAge.label"),
                  name: "default.reference.maxAge",
                  readOnly: false,
                  secret: false,
                  type: "String"
              }
          ];

    const setupForm = (config?: AuthenticatorConfigRepresentation) => {
        convertToFormValues(config || {}, setValue);
    };

    const { data: execConfigData } = useExecutionConfig(execution);

    // Merge default config properties with fetched ones
    const configDescription = execConfigData?.configDescription
        ? {
              ...execConfigData.configDescription,
              properties: [
                  ...defaultConfigProperties,
                  ...(execConfigData.configDescription.properties || [])
              ]
          }
        : undefined;

    useEffect(() => {
        if (execConfigData?.config) {
            setConfig(execConfigData.config);
        }
    }, [execConfigData]);

    useEffect(() => {
        if (config) setupForm(config);
    }, [config]);

    const save = async (saved: ExecutionConfigModalForm) => {
        const changedConfig = convertFormValuesToObject(saved);
        try {
            if (config) {
                const newConfig = {
                    id: config.id,
                    alias: config.alias,
                    config: changedConfig.config
                };
                await adminClient.authenticationManagement.updateConfig(newConfig);
                setConfig({ ...newConfig });
            } else {
                const newConfig = {
                    id: execution.id!,
                    alias: changedConfig.alias,
                    config: changedConfig.config
                };
                const { id } =
                    await adminClient.authenticationManagement.createConfig(newConfig);
                setConfig({ ...newConfig.config, id, alias: newConfig.alias });
            }
            toast.success(t("configSaveSuccess"));
            setShow(false);
        } catch (error) {
            toast.error(t("configSaveError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        }
    };

    return (
        <>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label={t("settings")}
                            onClick={() => setShow(true)}
                        >
                            <Gear className="size-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>{t("settings")}</TooltipContent>
                </Tooltip>
            </TooltipProvider>
            {configDescription && (
                <Dialog
                    open={show}
                    onOpenChange={open => {
                        if (!open) setShow(false);
                    }}
                >
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>
                                {t("executionConfig", { name: configDescription.name })}
                            </DialogTitle>
                        </DialogHeader>
                        <form id="execution-config-form" onSubmit={handleSubmit(save)}>
                            <FormProvider {...form}>
                                <TextControl
                                    name="alias"
                                    label={t("alias")}
                                    labelIcon={t("authenticationAliasHelp")}
                                    rules={{ required: t("required") }}
                                    isDisabled={!!config}
                                />
                                <DynamicComponents
                                    stringify
                                    properties={configDescription.properties || []}
                                />
                            </FormProvider>
                            <div className="flex gap-2 mt-4">
                                <Button data-testid="save" type="submit">
                                    {t("save")}
                                </Button>
                                <Button
                                    data-testid="cancel"
                                    variant="link"
                                    onClick={() => {
                                        setShow(false);
                                    }}
                                >
                                    {t("cancel")}
                                </Button>
                                {config && (
                                    <Button
                                        className="ml-auto"
                                        data-testid="clear"
                                        variant="link"
                                        onClick={async () => {
                                            await adminClient.authenticationManagement.delConfig(
                                                {
                                                    id: config.id!
                                                }
                                            );
                                            setConfig(undefined);
                                            setShow(false);
                                        }}
                                    >
                                        {t("clear")} <Trash className="size-4" />
                                    </Button>
                                )}
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
};
