import type ClientScopeRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientScopeRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import {
    Select,
    SelectContent,
    SelectTrigger,
    SelectValue
} from "@merge-rd/ui/components/select";
import { useState } from "react";
import {
    type AllClientScopeType,
    allClientScopeTypes,
    ClientScope,
    type ClientScopeType,
    clientScopeTypesSelectOptions
} from "./client-scope-utils";

export type {
    AllClientScopeType,
    ClientScopeDefaultOptionalType,
    ClientScopeType
} from "./client-scope-utils";
// Re-export everything from client-scope-utils for backwards compatibility
export {
    AllClientScopes,
    addClientScope,
    allClientScopeTypes,
    ClientScope,
    changeClientScope,
    changeScope,
    clientScopeTypesDropdown,
    clientScopeTypesSelectOptions,
    removeClientScope,
    removeScope
} from "./client-scope-utils";

type CellDropdownProps = {
    clientScope: ClientScopeRepresentation;
    type: ClientScopeType | AllClientScopeType;
    all?: boolean;
    onSelect: (value: ClientScopeType | AllClientScopeType) => void;
    isDisabled?: boolean;
    /** Kucuk trigger icin (tablo hucresi) */
    className?: string;
};

const clientScopeTypes = Object.keys(ClientScope);

export const CellDropdown = ({
    clientScope,
    type,
    onSelect,
    all = false,
    isDisabled,
    className: classNameProp
}: CellDropdownProps) => {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);

    return (
        <Select
            key={`${clientScope.id}-${type}`}
            open={open}
            onOpenChange={setOpen}
            value={type}
            onValueChange={value => {
                onSelect(
                    all ? (value as ClientScopeType) : (value as AllClientScopeType)
                );
                setOpen(false);
            }}
            disabled={isDisabled}
        >
            <SelectTrigger
                id="cell-dropdown"
                className={classNameProp ?? `keycloak__client-scope__${type}`}
            >
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {clientScopeTypesSelectOptions(
                    t,
                    all ? allClientScopeTypes : clientScopeTypes
                )}
            </SelectContent>
        </Select>
    );
};
