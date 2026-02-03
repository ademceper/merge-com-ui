/* eslint-disable */
// @ts-nocheck

import { SingleSelect } from "./SingleSelect";
import { TypeaheadSelect } from "./TypeaheadSelect";

export type Variant = "single" | "typeahead" | "typeaheadMulti";

export enum SelectVariant {
    single = "single",
    typeahead = "typeahead",
    typeaheadMulti = "typeaheadMulti"
}

export const propertyToString = (prop: string | number | undefined) =>
    typeof prop === "number" ? prop + "px" : prop;

export type KeycloakSelectProps = {
    toggleId?: string;
    onFilter?: (value: string) => void;
    onClear?: () => void;
    variant?: Variant;
    isDisabled?: boolean;
    menuAppendTo?: string;
    maxHeight?: string | number;
    width?: string | number;
    toggleIcon?: React.ReactElement;
    direction?: "up" | "down";
    placeholderText?: string;
    onSelect?: (value: string | number | object) => void;
    onToggle: (val: boolean) => void;
    selections?: string | string[] | number | object;
    validated?: "success" | "warning" | "error" | "default";
    typeAheadAriaLabel?: string;
    chipGroupProps?: Record<string, unknown>;
    chipGroupComponent?: React.ReactNode;
    footer?: React.ReactNode;
    className?: string;
    "aria-label"?: string;
    children?: React.ReactNode;
    isOpen?: boolean;
};

export const KeycloakSelect = ({
    variant = SelectVariant.single,
    ...rest
}: KeycloakSelectProps) => {
    if (variant === SelectVariant.single) {
        return <SingleSelect {...rest} />;
    }
    return <TypeaheadSelect {...rest} variant={variant} />;
};
