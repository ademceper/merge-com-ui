import type GroupRepresentation from "@keycloak/keycloak-admin-client/lib/defs/groupRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Alert, AlertTitle } from "@merge-rd/ui/components/alert";
import { Button } from "@merge-rd/ui/components/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@merge-rd/ui/components/dialog";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
    getErrorDescription,
    getErrorMessage,
    TextControl
} from "../../../shared/keycloak-ui-shared";
import { useIsFeatureEnabled, Feature } from "../../shared/lib/use-is-feature-enabled";
import { useCreateGroup } from "./hooks/use-create-group";
import { useDuplicateGroup } from "./hooks/use-duplicate-group";
import { useGroup } from "./hooks/use-group";
import { useUpdateGroup } from "./hooks/use-update-group";

type GroupsModalProps = {
    id?: string;
    rename?: GroupRepresentation;
    duplicateId?: string;
    handleModalToggle: () => void;
    refresh: (group?: GroupRepresentation) => void;
    /** Controlled mode: dialog visibility */
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
};

export const GroupsModal = ({
    id,
    rename,
    duplicateId,
    handleModalToggle,
    refresh,
    open: controlledOpen,
    onOpenChange: controlledOnOpenChange
}: GroupsModalProps) => {
    const { t } = useTranslation();
    const isFeatureEnabled = useIsFeatureEnabled();
    const [duplicateGroupDetails, setDuplicateGroupDetails] =
        useState<GroupRepresentation | null>(null);

    const form = useForm({
        defaultValues: {
            name: rename?.name || "",
            description: rename?.description || ""
        }
    });
    const { handleSubmit, formState } = form;

    const { data: duplicateGroupData } = useGroup(duplicateId ?? "");
    const { mutateAsync: createGroup } = useCreateGroup();
    const { mutateAsync: updateGroupMutation } = useUpdateGroup(id ?? "");
    const { mutateAsync: duplicateGroupMutation } = useDuplicateGroup();

    useEffect(() => {
        if (duplicateGroupData && duplicateId) {
            setDuplicateGroupDetails(duplicateGroupData);
            form.reset({ name: t("copyOf", { name: duplicateGroupData.name }) });
        }
    }, [duplicateGroupData, duplicateId, form, t]);

    const submitForm = async (group: GroupRepresentation) => {
        group.name = group.name?.trim();

        try {
            if (duplicateId && duplicateGroupDetails) {
                await duplicateGroupMutation({
                    sourceGroup: duplicateGroupDetails,
                    copyName: t("copyOf", { name: duplicateGroupDetails.name }),
                    checkPermissions: isFeatureEnabled(Feature.AdminFineGrainedAuthz)
                });
            } else if (!id) {
                await createGroup({ group });
            } else if (rename) {
                await updateGroupMutation({
                    ...rename,
                    name: group.name,
                    description: group.description
                });
            } else {
                await createGroup({ group, parentId: id });
            }

            refresh(rename ? { ...rename, ...group } : undefined);
            handleModalToggle();
            toast.success(
                t(
                    rename
                        ? "groupUpdated"
                        : duplicateId
                          ? "groupDuplicated"
                          : "groupCreated"
                )
            );
        } catch (error) {
            toast.error(t("couldNotCreateGroup", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        }
    };

    const isOpen = controlledOpen ?? true;
    const handleOpenChange = (open: boolean) => {
        if (!open) handleModalToggle();
        controlledOnOpenChange?.(open);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-lg sm:max-w-lg" showCloseButton={true}>
                <DialogHeader className="w-full">
                    <div className="flex w-full flex-row items-center justify-between gap-2">
                        <DialogTitle className="min-w-0 flex-1 truncate">
                            {rename
                                ? t("editGroup")
                                : duplicateId
                                  ? t("duplicateAGroup")
                                  : t("createAGroup")}
                        </DialogTitle>
                    </div>
                </DialogHeader>
                <div className="min-h-[120px]">
                    <FormProvider {...form}>
                        <form
                            id="group-form"
                            onSubmit={handleSubmit(submitForm)}
                            className="flex flex-col gap-5 py-2"
                        >
                            {duplicateId && (
                                <Alert variant="destructive">
                                    <AlertTitle>{t("duplicateGroupWarning")}</AlertTitle>
                                </Alert>
                            )}
                            <TextControl
                                name="name"
                                label={t("name")}
                                showLabel
                                rules={{ required: t("required") }}
                                autoFocus
                            />
                            <TextControl
                                name="description"
                                label={t("description")}
                                showLabel
                            />
                        </form>
                    </FormProvider>
                </div>
                <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:flex-nowrap sm:items-center sm:justify-end sm:gap-4">
                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:shrink-0 sm:items-center">
                        <DialogClose asChild>
                            <Button
                                id="modal-cancel"
                                data-testid="cancel"
                                variant="ghost"
                                className="h-9 min-h-9 w-full text-foreground sm:w-auto"
                            >
                                {t("cancel")}
                            </Button>
                        </DialogClose>
                        <Button
                            type="submit"
                            form="group-form"
                            data-testid={`${rename ? "rename" : duplicateId ? "duplicate" : "create"}Group`}
                            disabled={
                                formState.isLoading ||
                                formState.isValidating ||
                                formState.isSubmitting
                            }
                            className="h-9 min-h-9 w-full group sm:w-auto"
                        >
                            {t(rename ? "edit" : duplicateId ? "duplicate" : "create")}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
