import { DropdownMenuItem } from "@merge/ui/components/dropdown-menu";
import { ViewHeader } from "../components/view-header/ViewHeader";
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
} from "@merge/ui/components/alert-dialog";
import { useConfirmDialog } from "../components/confirm-dialog/ConfirmDialog";
import { useState } from "react";
import { useAdminClient } from "../admin-client";
import { useNavigate } from "react-router-dom";
import { getErrorDescription, getErrorMessage } from "../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { toOrganizations } from "./routes/Organizations";
import { useRealm } from "../context/realm-context/RealmContext";

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
                    <ViewHeader
                        titleKey={name || ""}
                        divider={false}
                        dropdownItems={[
                            <DropdownMenuItem
                                data-testid="delete-client"
                                key="delete"
                                onClick={() => setDeleteDialogOpen(true)}
                            >
                                {t("delete")}
                            </DropdownMenuItem>
                        ]}
                        isEnabled={value}
                        onToggle={value => {
                            if (!value) {
                                toggleDisableDialog();
                            } else {
                                onChange(value);
                                save();
                            }
                        }}
                    />
                </>
            )}
        />
    );
};
