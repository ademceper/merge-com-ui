/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "shared/keycloak-ui-shared/controls/table/PaginatingTableToolbar.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the keycloakify sync-extensions.
 */

/* eslint-disable */

// @ts-nocheck

import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from "@merge/ui/components/pagination";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@merge/ui/components/select";
import { Button } from "@merge/ui/components/button";
import { PropsWithChildren, ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { TableToolbar } from "./TableToolbar";

type KeycloakPaginationProps = {
    id?: string;
    count: number;
    first: number;
    max: number;
    onNextClick: (page: number) => void;
    onPreviousClick: (page: number) => void;
    onPerPageSelect: (max: number, first: number) => void;
    variant?: "top" | "bottom";
};

type TableToolbarProps = KeycloakPaginationProps & {
    searchTypeComponent?: ReactNode;
    toolbarItem?: ReactNode;
    subToolbar?: ReactNode;
    inputGroupName?: string;
    inputGroupPlaceholder?: string;
    inputGroupOnEnter?: (value: string) => void;
};

const PER_PAGE_OPTIONS = [10, 20, 50, 100];

const KeycloakPagination = ({
    id,
    variant = "top",
    count,
    first,
    max,
    onNextClick,
    onPreviousClick,
    onPerPageSelect
}: KeycloakPaginationProps) => {
    const { t } = useTranslation();
    const page = Math.round(first / max);
    const totalPages = Math.ceil((count + page * max) / max) || 1;
    const currentPage = page + 1;
    const firstIndex = first + 1;
    const lastIndex = Math.min(first + max, count + page * max);

    return (
        <div id={id} className="flex items-center gap-2" aria-label={`${t("pagination")} ${variant}`}>
            <span className="text-muted-foreground text-sm whitespace-nowrap">
                <strong>{firstIndex}</strong> - <strong>{lastIndex}</strong>
            </span>
            <Select
                value={String(max)}
                onValueChange={v => onPerPageSelect(Number(v), 0)}
            >
                <SelectTrigger size="sm" className="w-[70px]">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {PER_PAGE_OPTIONS.map(n => (
                        <SelectItem key={n} value={String(n)}>
                            {n}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            href="#"
                            onClick={e => {
                                e?.preventDefault?.();
                                if (currentPage > 1) onPreviousClick((currentPage - 2) * max);
                            }}
                            className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                        />
                    </PaginationItem>
                    <PaginationItem>
                        <span className="text-muted-foreground px-2 text-sm">
                            {t("paginationPage", { page: currentPage, total: totalPages })}
                        </span>
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationNext
                            href="#"
                            onClick={e => {
                                e?.preventDefault?.();
                                if (currentPage < totalPages) onNextClick(currentPage * max);
                            }}
                            className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
};

export const PaginatingTableToolbar = ({
    count,
    searchTypeComponent,
    toolbarItem,
    subToolbar,
    children,
    inputGroupName,
    inputGroupPlaceholder,
    inputGroupOnEnter,
    ...rest
}: PropsWithChildren<TableToolbarProps>) => {
    return (
        <TableToolbar
            searchTypeComponent={searchTypeComponent}
            toolbarItem={
                <>
                    {toolbarItem}
                    <div className="flex items-center">
                        <KeycloakPagination count={count} {...rest} />
                    </div>
                </>
            }
            subToolbar={subToolbar}
            toolbarItemFooter={
                count !== 0 ? (
                    <div className="flex items-center">
                        <KeycloakPagination count={count} variant="bottom" {...rest} />
                    </div>
                ) : null
            }
            inputGroupName={inputGroupName}
            inputGroupPlaceholder={inputGroupPlaceholder}
            inputGroupOnEnter={inputGroupOnEnter}
        >
            {children}
        </TableToolbar>
    );
};
