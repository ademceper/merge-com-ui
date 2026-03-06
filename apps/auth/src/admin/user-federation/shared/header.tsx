import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@merge-rd/ui/components/dropdown-menu";
import { Label } from "@merge-rd/ui/components/label";
import { Switch } from "@merge-rd/ui/components/switch";
import { buttonVariants } from "@merge-rd/ui/components/button";
import { ReactElement } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useAdminClient } from "../../admin-client";
import { getErrorDescription, getErrorMessage } from "../../../shared/keycloak-ui-shared";
import { toast } from "sonner";
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
import { useConfirmDialog } from "../../components/confirm-dialog/confirm-dialog";
import { useState } from "react";

import { useRealm } from "../../context/realm-context/realm-context";
import { CustomUserFederationRouteParams } from "../routes/custom-user-federation";
import { toUserFederation } from "../routes/user-federation";

type HeaderProps = {
    provider: string;
    save: () => void;
    dropdownItems?: ReactElement[];
    noDivider?: boolean;
};

export const Header = ({
    provider,
    save,
    noDivider = false,
    dropdownItems = []
}: HeaderProps) => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const { id } = useParams<Partial<CustomUserFederationRouteParams>>();
    const navigate = useNavigate();
const { realm } = useRealm();

    const { control, setValue } = useFormContext();

    const [toggleDisableDialog, DisableConfirm] = useConfirmDialog({
        titleKey: "userFedDisableConfirmTitle",
        messageKey: "userFedDisableConfirm",
        continueButtonLabel: "disable",
        onConfirm: () => {
            setValue("config.enabled[0]", "false");
            save();
        }
    });

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const onDeleteConfirm = async () => {
        if (!id) return;
        try {
            await adminClient.components.del({ id });
            setDeleteDialogOpen(false);
            toast.success(t("userFedDeletedSuccess"));
            navigate(toUserFederation({ realm }), { replace: true });
        } catch (error) {
            toast.error(t("userFedDeleteError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    return (
        <>
            <DisableConfirm />
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("userFedDeleteConfirmTitle")}</AlertDialogTitle>
                        <AlertDialogDescription>{t("userFedDeleteConfirm")}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                        <AlertDialogAction variant="destructive" data-testid="confirm" onClick={onDeleteConfirm}>
                            {t("delete")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <Controller
                name="config.enabled"
                defaultValue={["true"]}
                control={control}
                render={({ field }) =>
                    !id ? null : (
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-2" />
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-2 mr-4">
                                    <Label htmlFor="user-federation-switch" className="text-sm">{t("enabled")}</Label>
                                    <Switch id="user-federation-switch" data-testid="user-federation-switch" checked={field.value?.[0] === "true" || field.value === "true"} aria-label={t("enabled")} onCheckedChange={value => {
                                        if (!value) {
                                            toggleDisableDialog();
                                        } else {
                                            field.onChange([value.toString()]);
                                            save();
                                        }
                                    }} />
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger data-testid="action-dropdown" className={buttonVariants()}>
                                        {t("action")}
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        {dropdownItems}
                                        <DropdownMenuItem
                                            key="delete"
                                            onClick={() => setDeleteDialogOpen(true)}
                                            data-testid="delete-cmd"
                                        >
                                            {t("deleteProvider")}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    )
                }
            />
        </>
    );
};
