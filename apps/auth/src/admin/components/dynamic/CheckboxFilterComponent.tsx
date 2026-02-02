/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/components/dynamic/CheckboxFilterComponent.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { Badge } from "@merge/ui/components/badge";
import { Checkbox } from "@merge/ui/components/checkbox";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@merge/ui/components/popover";
import { Button } from "@merge/ui/components/button";

type CheckboxFilterOptions = {
    value: string;
    label: string;
};

type CheckboxFilterComponentProps = {
    filterPlaceholderText: string;
    isOpen: boolean;
    options: CheckboxFilterOptions[];
    onOpenChange: (isOpen: boolean) => void;
    onToggleClick: () => void;
    onSelect: (event: React.MouseEvent<HTMLButtonElement>, selection: string) => void;
    selectedItems: string[];
    width?: string;
};

export const CheckboxFilterComponent = ({
    filterPlaceholderText,
    isOpen,
    options,
    onOpenChange,
    onToggleClick,
    onSelect,
    selectedItems,
    width
}: CheckboxFilterComponentProps) => {
    return (
        <Popover open={isOpen} onOpenChange={onOpenChange}>
            <PopoverTrigger asChild>
                <Button
                    id="checkbox-select"
                    variant="outline"
                    data-testid="checkbox-filter-select"
                    style={{ width }}
                    onClick={onToggleClick}
                >
                    {filterPlaceholderText}
                    {selectedItems.length > 0 && (
                        <Badge variant="secondary" className="ml-1">
                            {selectedItems.length}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-2" align="start">
                <div className="flex flex-col gap-2 max-h-64 overflow-auto">
                    {options.map(option => (
                        <label
                            key={option.value}
                            className="flex items-center gap-2 cursor-pointer text-sm"
                            data-testid={`checkbox-filter-option-${option.value}`}
                        >
                            <Checkbox
                                checked={selectedItems.includes(option.value)}
                                onCheckedChange={() => {
                                    onSelect({} as React.MouseEvent<HTMLButtonElement>, option.value);
                                }}
                            />
                            <span>{option.label}</span>
                        </label>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
};
