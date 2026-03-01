/**
 * This file has been claimed for ownership from @keycloakify/keycloak-account-ui version 260502.0.2.
 * To relinquish ownership and restore this file to its original content, run the following command:
 *
 * $ npx keycloakify own --path "account/account-security/LinkedAccountsToolbar.tsx" --revert
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@merge/ui/components/input";
import { Button } from "@merge/ui/components/button";
import { CaretLeft, CaretRight, MagnifyingGlass, X } from "@phosphor-icons/react";

type LinkedAccountsToolbarProps = {
    onFilter: (nameFilter: string) => void;
    count: number;
    first: number;
    max: number;
    onNextClick: (page: number) => void;
    onPreviousClick: (page: number) => void;
    onPerPageSelect: (max: number, first: number) => void;
    hasNext: boolean;
};

export const LinkedAccountsToolbar = ({
    count,
    first,
    max,
    onNextClick,
    onPreviousClick,
    onFilter,
    hasNext
}: LinkedAccountsToolbarProps) => {
    const { t } = useTranslation();
    const [nameFilter, setNameFilter] = useState("");

    const page = Math.round(first / max) + 1;

    return (
        <div className="flex items-center justify-between gap-4 mb-4">
            <div className="relative flex-1 max-w-sm">
                <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder={t("filterByName")}
                    aria-label={t("filterByName")}
                    value={nameFilter}
                    onChange={e => setNameFilter(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === "Enter") {
                            onFilter(nameFilter);
                        }
                    }}
                    className="pl-9 pr-8 h-9"
                />
                {nameFilter && (
                    <button
                        type="button"
                        onClick={() => {
                            setNameFilter("");
                            onFilter("");
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>
            <div className="flex items-center gap-1">
                <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    disabled={page <= 1}
                    onClick={() => onPreviousClick((page - 2) * max)}
                >
                    <CaretLeft className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    disabled={!hasNext}
                    onClick={() => onNextClick(page * max)}
                >
                    <CaretRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};
