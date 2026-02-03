/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "shared/keycloak-ui-shared/controls/table/TableToolbar.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { Input } from "@merge/ui/components/input";
import { Separator } from "@merge/ui/components/separator";
import { KeyboardEvent, PropsWithChildren, ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { MagnifyingGlass, X } from "@phosphor-icons/react";

type TableToolbarProps = {
    toolbarItem?: ReactNode;
    subToolbar?: ReactNode;
    toolbarItemFooter?: ReactNode;
    searchTypeComponent?: ReactNode;
    inputGroupName?: string;
    inputGroupPlaceholder?: string;
    inputGroupOnEnter?: (value: string) => void;
};

export const TableToolbar = ({
    toolbarItem,
    subToolbar,
    toolbarItemFooter,
    children,
    searchTypeComponent,
    inputGroupName,
    inputGroupPlaceholder,
    inputGroupOnEnter
}: PropsWithChildren<TableToolbarProps>) => {
    const { t } = useTranslation();
    const [searchValue, setSearchValue] = useState<string>("");

    const onSearch = (searchValue: string) => {
        setSearchValue(searchValue.trim());
        inputGroupOnEnter?.(searchValue.trim());
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            onSearch(searchValue);
        }
    };

    return (
        <>
            <div data-testid="table-toolbar" className="flex flex-wrap items-center gap-2">
                {inputGroupName && (
                    <div data-testid={inputGroupName} className="flex flex-1 min-w-0 items-center gap-1 rounded-lg border border-input bg-transparent px-2">
                        {searchTypeComponent}
                        {inputGroupPlaceholder && (
                            <>
                                <MagnifyingGlass className="text-muted-foreground size-4 shrink-0" />
                                <Input
                                    data-testid="table-search-input"
                                    placeholder={inputGroupPlaceholder}
                                    aria-label={t("search")}
                                    value={searchValue}
                                    onChange={e => setSearchValue(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className="border-0 bg-transparent shadow-none focus-visible:ring-0"
                                />
                                {searchValue && (
                                    <button
                                        type="button"
                                        onClick={() => onSearch("")}
                                        className="text-muted-foreground hover:text-foreground shrink-0 rounded p-0.5"
                                        aria-label={t("clear")}
                                    >
                                        <X className="size-4" />
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                )}
                {toolbarItem}
            </div>
            {subToolbar && (
                <div className="flex flex-wrap items-center gap-2">
                    {subToolbar}
                </div>
            )}
            <Separator />
            {children}
            {toolbarItemFooter && (
                <div className="flex flex-wrap items-center gap-2">
                    {toolbarItemFooter}
                </div>
            )}
        </>
    );
};
