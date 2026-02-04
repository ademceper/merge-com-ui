import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@merge/ui/components/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@merge/ui/components/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@merge/ui/components/select";
import { Funnel } from "@phosphor-icons/react";

import {
    AllClientScopes,
    AllClientScopeType,
    clientScopeTypesSelectOptions
} from "../../components/client-scope/ClientScopeTypes";
import type { Row } from "../../clients/scopes/ClientScopes";
import useIsFeatureEnabled, { Feature } from "../../utils/useIsFeatureEnabled";
import { useMemo } from "react";

export type SearchType = "name" | "type" | "protocol";
export const PROTOCOLS = ["all", "saml", "openid-connect"] as const;
export type ProtocolType = (typeof PROTOCOLS)[number] | "oid4vc";

export const nameFilter =
    (search = "") =>
    (scope: Row) =>
        scope.name?.includes(search);
export const typeFilter = (type: AllClientScopeType) => (scope: Row) =>
    type === AllClientScopes.none || scope.type === type;

export const protocolFilter = (protocol: ProtocolType) => (scope: Row) =>
    protocol === "all" || scope.protocol === protocol;

type SearchToolbarProps = Omit<SearchDropdownProps, "withProtocol"> & {
    type: AllClientScopeType;
    onType: (value: AllClientScopes) => void;
    protocol?: ProtocolType;
    onProtocol?: (value: ProtocolType) => void;
};

type SearchDropdownProps = {
    searchType: SearchType;
    onSelect: (value: SearchType) => void;
    withProtocol?: boolean;
};

export const SearchDropdown = ({
    searchType,
    withProtocol = false,
    onSelect
}: SearchDropdownProps) => {
    const { t } = useTranslation();
    const [_searchToggle, setSearchToggle] = useState(false);

    const createDropdownItem = (st: SearchType) => (
        <DropdownMenuItem
            key={st}
            onClick={() => {
                onSelect(st);
                setSearchToggle(false);
            }}
        >
            {t(`clientScopeSearch.${st}`)}
        </DropdownMenuItem>
    );
    const options = [createDropdownItem("name"), createDropdownItem("type")];
    if (withProtocol) {
        options.push(createDropdownItem("protocol"));
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    data-testid="clientScopeSearch"
                >
                    <Funnel className="size-4 mr-1" /> {t(`clientScopeSearch.${searchType}`)}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>{options}</DropdownMenuContent>
        </DropdownMenu>
    );
};

export const SearchToolbar = ({
    searchType,
    onSelect,
    type,
    onType,
    protocol,
    onProtocol
}: SearchToolbarProps) => {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const isFeatureEnabled = useIsFeatureEnabled();
    const protocols = useMemo<readonly ProtocolType[]>(
        () =>
            isFeatureEnabled(Feature.OpenId4VCI)
                ? ([...PROTOCOLS, "oid4vc"] as const)
                : PROTOCOLS,
        [isFeatureEnabled]
    );

    return (
        <>
            {searchType === "type" && (
                <>
                    <div>
                        <SearchDropdown
                            searchType={searchType}
                            onSelect={onSelect}
                            withProtocol={!!protocol}
                        />
                    </div>
                    <div>
                        <Select
                            open={open}
                            onOpenChange={setOpen}
                            value={type === AllClientScopes.none ? "" : type}
                            onValueChange={(value) => {
                                onType((value || AllClientScopes.none) as AllClientScopes);
                                setOpen(false);
                            }}
                        >
                            <SelectTrigger data-testid="clientScopeSearchType" className="w-[180px]">
                                <SelectValue placeholder={t("allTypes")} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={AllClientScopes.none}>
                                    {t("allTypes")}
                                </SelectItem>
                                {clientScopeTypesSelectOptions(t)}
                            </SelectContent>
                        </Select>
                    </div>
                </>
            )}
            {searchType === "protocol" && !!protocol && (
                <>
                    <div>
                        <SearchDropdown
                            searchType={searchType}
                            onSelect={onSelect}
                            withProtocol
                        />
                    </div>
                    <div>
                        <Select
                            open={open}
                            onOpenChange={setOpen}
                            value={protocol}
                            onValueChange={(value) => {
                                onProtocol?.(value as ProtocolType);
                                setOpen(false);
                            }}
                        >
                            <SelectTrigger data-testid="clientScopeSearchProtocol" className="w-[180px]">
                                <SelectValue>{t(`protocolTypes.${protocol}`)}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {protocols.map((p) => (
                                    <SelectItem key={p} value={p}>
                                        {t(`protocolTypes.${p}`)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </>
            )}
        </>
    );
};
