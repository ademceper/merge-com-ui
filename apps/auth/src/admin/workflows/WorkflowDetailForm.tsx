import { Button } from "@merge/ui/components/button";
import { Label } from "@merge/ui/components/label";
import { Controller, FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import yaml from "yaml";
import { useAdminClient } from "../admin-client";
import { getErrorDescription, getErrorMessage, HelpItem,
    FormSubmitButton,
    useFetch } from "../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { useRealm } from "../context/realm-context/RealmContext";
import { FormAccess } from "../components/form/FormAccess";
import { toWorkflows } from "./routes/Workflows";
import CodeEditor from "../components/form/CodeEditor";
import { useParams } from "../utils/useParams";
import { WorkflowDetailParams, toWorkflowDetail } from "./routes/WorkflowDetail";
import { ViewHeader } from "../components/view-header/ViewHeader";
import type WorkflowRepresentation from "@keycloak/keycloak-admin-client/lib/defs/workflowRepresentation";

type AttributeForm = {
    workflowYAML: string;
};

export default function WorkflowDetailForm() {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const navigate = useNavigate();
    const { realm } = useRealm();
const { mode, id } = useParams<WorkflowDetailParams>();
    const form = useForm<AttributeForm>({
        mode: "onChange",
        defaultValues: {
            workflowYAML: ""
        }
    });
    const { control, handleSubmit, setValue } = form;

    useFetch(
        async () => {
            if (mode === "create") {
                return undefined;
            }
            return adminClient.workflows.findOne({
                id: id!,
                includeId: false
            });
        },
        workflow => {
            if (!workflow) {
                return;
            }

            const workflowToSet = { ...workflow };
            if (mode === "copy") {
                delete workflowToSet.id;
                workflowToSet.name = `${workflow.name} -- ${t("copy")}`;
            }

            setValue("workflowYAML", yaml.stringify(workflowToSet));
        },
        [mode, id, setValue, t]
    );

    const validateworkflowYAML = (yamlStr: string): WorkflowRepresentation => {
        const json: WorkflowRepresentation = yaml.parse(yamlStr);
        if (!json.name) {
            throw new Error(t("workflowNameRequired"));
        }
        return json;
    };

    const onUpdate: SubmitHandler<AttributeForm> = async data => {
        try {
            const json = validateworkflowYAML(data.workflowYAML);
            await adminClient.workflows.update({ id }, json);
            toast.success(t("workflowUpdated"));
        } catch (error) {
            toast.error(t("workflowUpdateError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    const onCreate: SubmitHandler<AttributeForm> = async data => {
        try {
            await adminClient.workflows.createAsYaml({
                realm,
                yaml: data.workflowYAML
            });
            toast.success(t("workflowCreated"));
            navigate(toWorkflows({ realm }));
        } catch (error) {
            toast.error(t("workflowCreateError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    const titlekeyMap: Record<WorkflowDetailParams["mode"], string> = {
        copy: "copyWorkflow",
        create: "createWorkflow",
        update: "updateWorkflow"
    };

    const subkeyMap: Record<WorkflowDetailParams["mode"], string> = {
        copy: "copyWorkflowDetails",
        create: "createWorkflowDetails",
        update: "updateWorkflowDetails"
    };

    return (
        <>
            <ViewHeader titleKey={titlekeyMap[mode]} subKey={subkeyMap[mode]} />

            <FormProvider {...form}>
                <div className="bg-muted/30 p-4">
                    <FormAccess
                        isHorizontal
                        onSubmit={
                            mode === "update"
                                ? handleSubmit(onUpdate)
                                : handleSubmit(onCreate)
                        }
                        role={"manage-realm"}
                        className="mt-4"
                        fineGrainedAccess={true}
                    >
                        <div className="space-y-2">
                            <Label htmlFor="code" className="flex items-center gap-1">
                                {t("workflowYAML")}
                                <HelpItem
                                    helpText={t("workflowYAMLHelp")}
                                    fieldLabelId="code"
                                />
                            </Label>
                            <Controller
                                name="workflowYAML"
                                control={control}
                                render={({ field }) => (
                                    <CodeEditor
                                        id="workflowYAML"
                                        data-testid="workflowYAML"
                                        value={field.value}
                                        onChange={field.onChange}
                                        language="yaml"
                                        height={600}
                                    />
                                )}
                            />
                        </div>
                        <div className="flex gap-2">
                            <FormSubmitButton
                                formState={form.formState}
                                data-testid="save"
                                allowInvalid
                                allowNonDirty
                                isDisabled={mode === "create" && !form.formState.isDirty}
                            >
                                {mode === "update" ? t("save") : t("create")}
                            </FormSubmitButton>
                            {mode === "update" && (
                                <Button data-testid="copy" variant="link" asChild>
                                    <Link
                                        to={toWorkflowDetail({
                                            realm,
                                            mode: "copy",
                                            id: id!
                                        })}
                                    >
                                        {t("copy")}
                                    </Link>
                                </Button>
                            )}
                            <Button data-testid="cancel" variant="link" asChild>
                                <Link to={toWorkflows({ realm })}>{t("cancel")}</Link>
                            </Button>
                        </div>
                    </FormAccess>
                </div>
            </FormProvider>
        </>
    );
}
