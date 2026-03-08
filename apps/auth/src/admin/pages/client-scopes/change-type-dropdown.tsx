import { useTranslation } from "@merge-rd/i18n";
import {
    Select,
    SelectContent,
    SelectTrigger,
    SelectValue
} from "@merge-rd/ui/components/select";
import { useState } from "react";
import { toast } from "sonner";
import { getErrorDescription, getErrorMessage } from "../../../shared/keycloak-ui-shared";
import {
    allClientScopeTypes,
    type ClientScope,
    changeClientScope,
    changeScope,
    clientScopeTypesSelectOptions
} from "../../shared/ui/client-scope/client-scope-types";
import type { Row } from "../clients/scopes/client-scopes";

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

    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    return (
        <Select
            open={open}
            onOpenChange={setOpen}
            onValueChange={async value => {
                try {
                    await Promise.all(
                        selectedRows.map(row =>
                            clientId
                                ? changeClientScope(
                                      clientId,
                                      row,
                                      row.type,
                                      value as ClientScope
                                  )
                                : changeScope(row, value as ClientScope)
                        )
                    );
                    setOpen(false);
                    refresh();
                    toast.success(t("clientScopeSuccess"));
                } catch (error) {
                    toast.error(
                        t("clientScopeError", { error: getErrorMessage(error) }),
                        { description: getErrorDescription(error) }
                    );
                }
            }}
        >
            <SelectTrigger
                id="change-type-dropdown"
                disabled={selectedRows.length === 0}
                aria-label="change-type-to"
                className="border border-input bg-background hover:bg-muted/50 w-auto min-w-[140px]"
            >
                <SelectValue placeholder={t("changeTypeTo")} />
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
