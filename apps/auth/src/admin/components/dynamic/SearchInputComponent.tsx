/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/components/dynamic/SearchInputComponent.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { Button } from "@merge/ui/components/button";
import { Input } from "@merge/ui/components/input";
import { ArrowRight, MagnifyingGlass, X } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";

type SearchInputComponentProps = {
    value: string;
    onChange: (value: string) => void;
    onSearch: (value: string) => void;
    onClear: () => void;
    placeholder?: string;
    "aria-label"?: string;
};

export const SearchInputComponent = ({
    value,
    onChange,
    onSearch,
    onClear,
    placeholder,
    "aria-label": ariaLabel
}: SearchInputComponentProps) => {
    const { t } = useTranslation();

    return (
        <div className="flex gap-1">
            <div className="relative flex-1">
                <MagnifyingGlass className="size-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    aria-label={ariaLabel}
                    data-testid="search-input"
                    className="pl-8"
                />
                {value && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2"
                        onClick={onClear}
                        aria-label={t("clear")}
                        data-testid="clear-search"
                    >
                        <X className="size-4" />
                    </Button>
                )}
            </div>
            <Button
                variant="outline"
                style={{ marginLeft: "0.1rem" }}
                onClick={() => onSearch(value)}
                aria-label={t("search")}
                data-testid="search"
            >
                <ArrowRight className="size-4" />
            </Button>
        </div>
    );
};
