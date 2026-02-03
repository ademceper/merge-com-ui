/* eslint-disable */
// @ts-nocheck

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@merge/ui/components/select";
import { Children, useState } from "react";
import type { KeycloakSelectProps } from "./KeycloakSelect";

type SingleSelectProps = Omit<KeycloakSelectProps, "variant">;

export const SingleSelect = ({
    toggleId,
    onToggle,
    onSelect,
    selections,
    isOpen,
    placeholderText,
    className,
    isDisabled,
    children,
    ...props
}: SingleSelectProps) => {
    const [open, setOpen] = useState(false);
    const controlledOpen = isOpen !== undefined ? isOpen : open;
    const setControlledOpen = (v: boolean) => {
        if (isOpen === undefined) setOpen(v);
        onToggle(v);
    };

    const childArray = Children.toArray(children) as React.ReactElement[];
    const valueToStr = (v: unknown) =>
        v == null ? "" : typeof v === "object" ? (v as { id?: string })?.id ?? JSON.stringify(v) : String(v);
    const value = selections != null ? valueToStr(selections) : "";
    const valueMap = new Map<string, unknown>();
    childArray.forEach((child) => {
        const val = child.props?.value;
        if (val !== undefined && val !== null) valueMap.set(valueToStr(val), val);
    });

    return (
        <Select
            value={value || undefined}
            onValueChange={(v) => {
                onSelect?.(valueMap.get(v) ?? v);
                setControlledOpen(false);
            }}
            open={controlledOpen}
            onOpenChange={setControlledOpen}
            disabled={isDisabled}
        >
            <SelectTrigger
                id={toggleId}
                className={className}
                aria-label={props["aria-label"]}
            >
                <SelectValue placeholder={placeholderText} />
            </SelectTrigger>
            <SelectContent>
                {childArray.map((child) => {
                    const val = child.props?.value;
                    const key = child.key ?? valueToStr(val);
                    if (val === undefined || val === null) return null;
                    const valueStr = valueToStr(val);
                    return (
                        <SelectItem key={key} value={valueStr}>
                            {child.props?.children ?? valueStr}
                        </SelectItem>
                    );
                })}
            </SelectContent>
        </Select>
    );
};
