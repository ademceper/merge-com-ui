import { Button } from "@merge/ui/components/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@merge/ui/components/dialog";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@merge/ui/components/tooltip";
import { PencilSimple } from "@phosphor-icons/react";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { TextAreaControl, TextControl } from "../../../shared/keycloak-ui-shared";
import useToggle from "../../utils/useToggle";
import type { ExpandableExecution } from "../execution-model";

type EditFlowProps = {
    execution: ExpandableExecution;
    onRowChange: (execution: ExpandableExecution) => void;
};

type FormFields = Omit<ExpandableExecution, "executionList">;

export const EditFlow = ({ execution, onRowChange }: EditFlowProps) => {
    const { t } = useTranslation();
    const form = useForm<FormFields>({
        mode: "onChange",
        defaultValues: execution
    });
    const [show, toggle] = useToggle();

    useEffect(() => form.reset(execution), [execution]);

    const onSubmit = (formValues: FormFields) => {
        onRowChange({ ...execution, ...formValues });
        toggle();
    };

    return (
        <>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            data-testid={`${execution.id}-edit`}
                            aria-label={t("edit")}
                            onClick={toggle}
                        >
                            <PencilSimple className="size-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>{t("edit")}</TooltipContent>
                </Tooltip>
            </TooltipProvider>
            {show && (
                <Dialog open onOpenChange={(open) => { if (!open) toggle(); }}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>{t("editFlow")}</DialogTitle>
                        </DialogHeader>
                        <form
                            id="edit-flow-form"
                            onSubmit={form.handleSubmit(onSubmit)}
                        >
                            <FormProvider {...form}>
                                <TextControl
                                    name="displayName"
                                    label={t("name")}
                                    labelIcon={t("flowNameHelp")}
                                    rules={{ required: t("required") }}
                                />
                                <TextAreaControl
                                    name="description"
                                    label={t("description")}
                                    labelIcon={t("flowDescriptionHelp")}
                                    rules={{
                                        maxLength: {
                                            value: 255,
                                            message: t("maxLength", { length: 255 })
                                        }
                                    }}
                                />
                            </FormProvider>
                        </form>
                        <DialogFooter>
                            <Button
                                key="confirm"
                                data-testid="confirm"
                                type="submit"
                                form="edit-flow-form"
                                disabled={!form.formState.isValid}
                            >
                                {t("edit")}
                            </Button>
                            <Button
                                data-testid="cancel"
                                key="cancel"
                                variant="link"
                                onClick={toggle}
                            >
                                {t("cancel")}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
};
