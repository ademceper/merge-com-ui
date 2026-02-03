/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/client-scopes/ChangeTypeDropdown.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import {
    Select,
    SelectContent,
    SelectTrigger,
    SelectValue
} from "@merge/ui/components/select";
import { Button } from "@merge/ui/components/button";
import { AlertVariant } from "../../shared/keycloak-ui-shared";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../admin-client";
import type { Row } from "../clients/scopes/ClientScopes";
import { useAlerts } from "../../shared/keycloak-ui-shared";
import {
    ClientScope,
    allClientScopeTypes,
    changeClientScope,
    changeScope,
    clientScopeTypesSelectOptions
} from "../components/client-scope/ClientScopeTypes";

type ChangeTypeDropdownProps = {
    clientId?: string;
    selectedRows: Row[];
    refresh: () => void;
};

export const ChangeTypeDropdown = ({
    clientId,
    selectedRows,
    refresh
}: ChangeTypeDropdownProps) => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const [open, setOpen] = useState(false);

    const { addAlert, addError } = useAlerts();

    return (
        <Select
            open={open}
            onOpenChange={setOpen}
            onValueChange={async (value) => {
                try {
                    await Promise.all(
                        selectedRows.map(row =>
                            clientId
                                ? changeClientScope(
                                      adminClient,
                                      clientId,
                                      row,
                                      row.type,
                                      value as ClientScope
                                  )
                                : changeScope(adminClient, row, value as ClientScope)
                        )
                    );
                    setOpen(false);
                    refresh();
                    addAlert(t("clientScopeSuccess"), AlertVariant.success);
                } catch (error) {
                    addError("clientScopeError", error);
                }
            }}
        >
            <SelectTrigger asChild>
                <Button
                    id="change-type-dropdown"
                    variant="outline"
                    disabled={selectedRows.length === 0}
                    aria-label="change-type-to"
                >
                    <SelectValue placeholder={t("changeTypeTo")} />
                </Button>
            </SelectTrigger>
            <SelectContent>
                {clientScopeTypesSelectOptions(
                    t,
                    !clientId ? allClientScopeTypes : undefined
                )}
            </SelectContent>
        </Select>
    );
};
