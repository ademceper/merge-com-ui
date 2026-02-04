import {
    Select,
    SelectContent,
    SelectTrigger,
    SelectValue
} from "@merge/ui/components/select";
import { Button } from "@merge/ui/components/button";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../admin-client";
import type { Row } from "../clients/scopes/ClientScopes";
import { getErrorDescription, getErrorMessage } from "../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
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
                    toast.success(t("clientScopeSuccess"));
                } catch (error) {
                    toast.error(t("clientScopeError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
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
