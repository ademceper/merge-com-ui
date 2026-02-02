/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/organizations/DetailOraganzationHeader.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { DropdownMenuItem } from "@merge/ui/components/dropdown-menu";
import { ViewHeader } from "../components/view-header/ViewHeader";
import { useTranslation } from "react-i18next";
import { useConfirmDialog } from "../components/confirm-dialog/ConfirmDialog";
import { useAdminClient } from "../admin-client";
import { useNavigate } from "react-router-dom";
import { useAlerts } from "../../shared/keycloak-ui-shared";
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
    const { addAlert, addError } = useAlerts();

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

    const [toggleDeleteDialog, DeleteConfirm] = useConfirmDialog({
        titleKey: "organizationDelete",
        messageKey: "organizationDeleteConfirm",
        continueButtonLabel: "delete",
        continueButtonVariant: "destructive",
        onConfirm: async () => {
            try {
                await adminClient.organizations.delById({ id });
                addAlert(t("organizationDeletedSuccess"));
                navigate(toOrganizations({ realm }));
            } catch (error) {
                addError("organizationDeleteError", error);
            }
        }
    });

    return (
        <Controller
            name="enabled"
            render={({ field: { value, onChange } }) => (
                <>
                    <DeleteConfirm />
                    <DisableConfirm />
                    <ViewHeader
                        titleKey={name || ""}
                        divider={false}
                        dropdownItems={[
                            <DropdownMenuItem
                                data-testid="delete-client"
                                key="delete"
                                onClick={toggleDeleteDialog}
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
