"use client";

import { Button } from "@merge/ui/components/button";
import { Popover, PopoverContent, PopoverTrigger } from "@merge/ui/components/popover";
import { get } from "lodash-es";
import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { getRuleValue } from "../utils/getRuleValue";
import { FormLabel } from "./FormLabel";

export type MultiSelectOption = { key: string; value: string } | string;

function optKey(o: MultiSelectOption): string {
    return typeof o === "string" ? o : o.key;
}
function optVal(o: MultiSelectOption): string {
    return typeof o === "string" ? o : o.value;
}

type MultiSelectFieldProps = {
    id?: string;
    name: string;
    label?: string;
    labelIcon?: string | React.ReactNode;
    options: MultiSelectOption[];
    defaultValue?: string[];
    rules?: { required?: unknown };
    placeholderText?: string;
    isDisabled?: boolean;
};

export function MultiSelectField({
    id,
    name,
    label,
    labelIcon,
    options,
    defaultValue = [],
    rules,
    placeholderText,
    isDisabled,
}: MultiSelectFieldProps) {
    const { control, formState: { errors } } = useFormContext();
    const [open, setOpen] = useState(false);
    const required = getRuleValue(rules?.required) === true;
    return (
        <FormLabel
            id={id}
            name={name}
            label={label}
            labelIcon={labelIcon}
            error={get(errors, name)}
            isRequired={required}
        >
            <Controller
                name={name}
                control={control}
                defaultValue={defaultValue}
                rules={rules}
                render={({ field }) => (
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={open}
                                disabled={isDisabled}
                                className="min-h-9 w-full justify-between font-normal"
                            >
                                <span className="truncate">
                                    {(field.value ?? []).length > 0
                                        ? (field.value ?? []).map((k: string) => optVal(options.find((o) => optKey(o) === k) ?? k)).join(", ")
                                        : placeholderText}
                                </span>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
                            <ul className="max-h-64 overflow-auto py-1">
                                {options.map((opt) => {
                                    const key = optKey(opt);
                                    const selected = (field.value ?? []).includes(key);
                                    return (
                                        <li
                                            key={key}
                                            role="option"
                                            aria-selected={selected}
                                            className="hover:bg-accent cursor-pointer px-2 py-1.5 text-sm"
                                            onMouseDown={(e) => e.preventDefault()}
                                            onClick={() => {
                                                if (selected) field.onChange((field.value ?? []).filter((x: string) => x !== key));
                                                else field.onChange([...(field.value ?? []), key]);
                                            }}
                                        >
                                            {optVal(opt)}
                                        </li>
                                    );
                                })}
                            </ul>
                            {(field.value ?? []).length > 0 && (
                                <div className="border-t px-2 py-1">
                                    <Button type="button" variant="ghost" size="sm" className="h-7 w-full justify-center" onClick={() => { field.onChange([]); setOpen(false); }}>
                                        Clear
                                    </Button>
                                </div>
                            )}
                        </PopoverContent>
                    </Popover>
                )}
            />
        </FormLabel>
    );
}
