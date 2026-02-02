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
import {
    MenuToggle,
    Select,
    SelectList,
    SelectOption
} from "../../../shared/@patternfly/react-core";

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
    const toggle = (toggleRef: React.RefObject<HTMLButtonElement>) => (
        <MenuToggle
            ref={toggleRef}
            onClick={onToggleClick}
            isExpanded={isOpen}
            style={{
                width
            }}
        >
            {filterPlaceholderText}
            {selectedItems.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                    {selectedItems.length}
                </Badge>
            )}
        </MenuToggle>
    );

    return (
        <Select
            role="menu"
            id="checkbox-select"
            isOpen={isOpen}
            selected={selectedItems}
            onSelect={(event, value) => {
                onSelect(event as React.MouseEvent<HTMLButtonElement>, value as string);
            }}
            onOpenChange={onOpenChange}
            toggle={toggle}
            data-testid="checkbox-filter-select"
        >
            <SelectList>
                {options.map(option => (
                    <SelectOption
                        key={option.value}
                        hasCheckbox
                        value={option.value}
                        isSelected={selectedItems.includes(option.value)}
                        data-testid={`checkbox-filter-option-${option.value}`}
                    >
                        {option.label}
                    </SelectOption>
                ))}
            </SelectList>
        </Select>
    );
};
