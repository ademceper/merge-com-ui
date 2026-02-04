import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@merge/ui/components/select";
import { get } from "lodash-es";
import { useState } from "react";
import { Controller, FieldPath, FieldValues, useFormContext } from "react-hook-form";
import { cn } from "@merge/ui/lib/utils";
import { getRuleValue } from "../../utils/getRuleValue";
import { FormLabel } from "../FormLabel";
import { SelectControlProps, isSelectBasedOptions, isString, key, type OptionType, type SelectControlOption } from "./SelectControl";

const EMPTY_OPTION_VALUE = "__empty__";

const toSelectValue = (k: string) => (k === "" ? EMPTY_OPTION_VALUE : k);
const toFormValue = (v: string) => (v === EMPTY_OPTION_VALUE ? "" : v);

export const SingleSelectControl = <
    T extends FieldValues,
    P extends FieldPath<T> = FieldPath<T>
>({
    id,
    name,
    label,
    options,
    selectedOptions = [],
    controller,
    labelIcon,
    isDisabled,
    onSelect,
    placeholderText,
    triggerClassName,
    triggerStyle,
    ...rest
}: SelectControlProps<T, P>) => {
    const {
        control,
        formState: { errors }
    } = useFormContext();
    const [open, setOpen] = useState(false);
    const required = getRuleValue(controller.rules?.required) === true;

    const allOptions = [...(Array.isArray(options) ? options : []), ...(selectedOptions || [])];

    return (
        <FormLabel
            id={id}
            name={name}
            label={label}
            isRequired={required}
            error={get(errors, name)}
            labelIcon={labelIcon}
        >
            <Controller
                {...controller}
                name={name}
                control={control}
                render={({ field: { onChange, value } }) => {
                    const strValue = Array.isArray(value) ? value[0] : value;
                    const displayValue = isSelectBasedOptions(allOptions as OptionType)
                        ? (allOptions as SelectControlOption[]).find(o => o.key === strValue)?.value ?? ""
                        : (strValue ?? "");
                    const rawFormValue = strValue ?? "";
                    const selectValue = toSelectValue(rawFormValue);
                    return (
                        <Select
                            {...rest}
                            open={open}
                            onOpenChange={setOpen}
                            value={selectValue}
                            onValueChange={v => {
                                const formVal = toFormValue(v);
                                const convertedValue = Array.isArray(value) ? [formVal] : formVal;
                                if (onSelect) {
                                    onSelect(convertedValue, onChange);
                                } else {
                                    onChange(convertedValue);
                                }
                                setOpen(false);
                            }}
                            disabled={isDisabled}
                        >
                            <SelectTrigger
                                id={id || name}
                                aria-label={label}
                                aria-invalid={!!get(errors, name)}
                                className={cn("w-full", triggerClassName)}
                                style={triggerStyle}
                            >
                                <SelectValue placeholder={placeholderText}>
                                    {displayValue}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent data-testid={`select-${name}`}>
                                {allOptions.map(option => {
                                    const optKey = key(option);
                                    return (
                                        <SelectItem key={optKey} value={toSelectValue(optKey)}>
                                            {isString(option) ? option : option.value}
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                    );
                }}
            />
        </FormLabel>
    );
};
