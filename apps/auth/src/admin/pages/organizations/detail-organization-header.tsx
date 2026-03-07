import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@merge-rd/ui/components/dropdown-menu";
import { Label } from "@merge-rd/ui/components/label";
import { Switch } from "@merge-rd/ui/components/switch";
import { buttonVariants } from "@merge-rd/ui/components/button";
import { useTranslation } from "react-i18next";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@merge-rd/ui/components/alert-dialog";
import { useConfirmDialog } from "../../shared/ui/confirm-dialog/confirm-dialog";
import { useState } from "react";
import { useAdminClient } from "../../app/admin-client";
import { useNavigate } from "react-router-dom";
import { getErrorDescription, getErrorMessage } from "../../../shared/keycloak-ui-shared";
import { toast } from "sonner";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { toOrganizations } from "./routes/organizations";
import { useRealm } from "../../app/providers/realm-context/realm-context";

type DetailOrganizationHeaderProps = {
    save: () => void;
};

export const DetailOrganizationHeader = ({ save }: DetailOrganizationHeaderProps) => {
    const { adminClient } = useAdminClient();
    const { realm } = useRealm();
    const navigate = useNavigate();

    const { t } = useTranslation();
const id = useWatch({ name: "id" });
    const name = useWatch({ name: "name" });

    const { setValue } = useFormContext();

    const [toggleDisableDialog, DisableConfirm] = useConfirmDialog({
        titleKey: "disableConfirmOrganizationTitle",
        messageKey: "disableConfirmOrganization",
        continueButtonLabel: "disable",
        onConfirm: () => {
            setValue("enabled", false);
            save();
        }
    });

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const onDeleteConfirm = async () => {
        try {
            await adminClient.organizations.delById({ id });
            setDeleteDialogOpen(false);
            toast.success(t("organizationDeletedSuccess"));
            navigate(toOrganizations({ realm }));
        } catch (error) {
            toast.error(t("organizationDeleteError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    return (
        <Controller
            name="enabled"
            render={({ field: { value, onChange } }) => (
                <>
                    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>{t("organizationDelete")}</AlertDialogTitle>
                                <AlertDialogDescription>{t("organizationDeleteConfirm")}</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                                <AlertDialogAction variant="destructive" data-testid="confirm" onClick={onDeleteConfirm}>
                                    {t("delete")}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <DisableConfirm />
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2" />
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2 mr-4">
                                <Label htmlFor="organization-switch" className="text-sm">{t("enabled")}</Label>
                                <Switch id="organization-switch" data-testid="organization-switch" checked={value} aria-label={t("enabled")} onCheckedChange={val => {
                                    if (!val) {
                                        toggleDisableDialog();
                                    } else {
                                        onChange(val);
                                        save();
                                    }
                                }} />
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger data-testid="action-dropdown" className={buttonVariants()}>
                                    {t("action")}
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                        data-testid="delete-client"
                                        key="delete"
                                        onClick={() => setDeleteDialogOpen(true)}
                                    >
                                        {t("delete")}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </>
            )}
        />
    );
};
