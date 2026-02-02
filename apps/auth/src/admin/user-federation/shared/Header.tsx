/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/user-federation/shared/Header.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { AlertVariant } from "../../../shared/keycloak-ui-shared";
import { DropdownMenuItem } from "@merge/ui/components/dropdown-menu";
import { ReactElement } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useAdminClient } from "../../admin-client";
import { useAlerts } from "../../../shared/keycloak-ui-shared";
import { useConfirmDialog } from "../../components/confirm-dialog/ConfirmDialog";
import { ViewHeader } from "../../components/view-header/ViewHeader";
import { useRealm } from "../../context/realm-context/RealmContext";
import { CustomUserFederationRouteParams } from "../routes/CustomUserFederation";
import { toUserFederation } from "../routes/UserFederation";

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

    const { addAlert, addError } = useAlerts();
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

    const [toggleDeleteDialog, DeleteConfirm] = useConfirmDialog({
        titleKey: "userFedDeleteConfirmTitle",
        messageKey: "userFedDeleteConfirm",
        continueButtonLabel: "delete",
        continueButtonVariant: "destructive",
        onConfirm: async () => {
            try {
                await adminClient.components.del({ id: id! });
                addAlert(t("userFedDeletedSuccess"), AlertVariant.success);
                navigate(toUserFederation({ realm }), { replace: true });
            } catch (error) {
                addError("userFedDeleteError", error);
            }
        }
    });

    return (
        <>
            <DisableConfirm />
            <DeleteConfirm />
            <Controller
                name="config.enabled"
                defaultValue={["true"]}
                control={control}
                render={({ field }) =>
                    !id ? (
                        <ViewHeader
                            titleKey={t("addProvider", {
                                provider: provider,
                                count: 1
                            })}
                        />
                    ) : (
                        <ViewHeader
                            divider={!noDivider}
                            titleKey={provider}
                            dropdownItems={[
                                ...dropdownItems,
                                <DropdownMenuItem
                                    key="delete"
                                    onClick={() => toggleDeleteDialog()}
                                    data-testid="delete-cmd"
                                >
                                    {t("deleteProvider")}
                                </DropdownMenuItem>
                            ]}
                            isEnabled={
                                field.value?.[0] === "true" || field.value === "true"
                            }
                            onToggle={value => {
                                if (!value) {
                                    toggleDisableDialog();
                                } else {
                                    field.onChange([value.toString()]);
                                    save();
                                }
                            }}
                        />
                    )
                }
            />
        </>
    );
};
