/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/client-scopes/details/SearchFilter.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@merge/ui/components/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@merge/ui/components/dropdown-menu";
import { Select, SelectList, SelectOption } from "../../../shared/@patternfly/react-core";
import { MenuToggle } from "../../../shared/@patternfly/react-core";
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
    const [searchToggle, setSearchToggle] = useState(false);

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
                            toggle={ref => (
                                <MenuToggle
                                    data-testid="clientScopeSearchType"
                                    ref={ref}
                                    isExpanded={open}
                                    onClick={() => setOpen(!open)}
                                >
                                    {type === AllClientScopes.none
                                        ? t("allTypes")
                                        : t(`clientScopeTypes.${type}`)}
                                </MenuToggle>
                            )}
                            onOpenChange={val => setOpen(val)}
                            isOpen={open}
                            selected={
                                type === AllClientScopes.none
                                    ? t("allTypes")
                                    : t(`clientScopeTypes.${type}`)
                            }
                            onSelect={(_, value) => {
                                onType(value as AllClientScopes);
                                setOpen(false);
                            }}
                        >
                            <SelectList>
                                <SelectOption value={AllClientScopes.none}>
                                    {t("allTypes")}
                                </SelectOption>
                                {clientScopeTypesSelectOptions(t)}
                            </SelectList>
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
                            toggle={ref => (
                                <MenuToggle
                                    data-testid="clientScopeSearchProtocol"
                                    ref={ref}
                                    isExpanded={open}
                                    onClick={() => setOpen(!open)}
                                >
                                    {t(`protocolTypes.${protocol}`)}
                                </MenuToggle>
                            )}
                            onOpenChange={val => setOpen(val)}
                            isOpen={open}
                            selected={t(`protocolTypes.${protocol}`)}
                            onSelect={(_, value) => {
                                onProtocol?.(value as ProtocolType);
                                setOpen(false);
                            }}
                        >
                            <SelectList>
                                {protocols.map(type => (
                                    <SelectOption key={type} value={type}>
                                        {t(`protocolTypes.${type}`)}
                                    </SelectOption>
                                ))}
                            </SelectList>
                        </Select>
                    </div>
                </>
            )}
        </>
    );
};
