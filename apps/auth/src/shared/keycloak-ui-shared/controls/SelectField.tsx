"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@merge/ui/components/select";
import { get } from "lodash-es";
import { Controller, useFormContext } from "react-hook-form";
import { getRuleValue } from "../utils/getRuleValue";
import { FormLabel } from "./FormLabel";

export type SelectOption = { key: string; value: string } | string;

function optKey(o: SelectOption): string {
    return typeof o === "string" ? o : o.key;
}
function optVal(o: SelectOption): string {
    return typeof o === "string" ? o : o.value;
}

type SelectFieldProps = {
    id?: string;
    name: string;
    label?: string;
    labelIcon?: string | React.ReactNode;
    options: SelectOption[];
    defaultValue?: string | number;
    rules?: { required?: unknown };
    placeholderText?: string;
    isDisabled?: boolean;
    className?: string;
};

export function SelectField({
    id,
    name,
    label,
    labelIcon,
    options,
    defaultValue = "",
    rules,
    placeholderText,
    isDisabled,
    className,
}: SelectFieldProps) {
    const { control, formState: { errors } } = useFormContext();
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
                    <Select
                        value={field.value === "" || field.value == null ? "" : String(field.value)}
                        onValueChange={field.onChange}
                        disabled={isDisabled}
                    >
                        <SelectTrigger id={id ?? name} className={className}>
                            <SelectValue placeholder={placeholderText} />
                        </SelectTrigger>
                        <SelectContent>
                            {options.map((opt) => (
                                <SelectItem key={optKey(opt)} value={optKey(opt)}>
                                    {optVal(opt)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            />
        </FormLabel>
    );
}
