import { Badge } from "@merge/ui/components/badge";
import { Button } from "@merge/ui/components/button";
import { Input } from "@merge/ui/components/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@merge/ui/components/popover";
import { X } from "@phosphor-icons/react";
import { get } from "lodash-es";
import { useMemo, useRef, useState } from "react";
import {
    Controller,
    ControllerRenderProps,
    FieldPath,
    FieldValues,
    useFormContext
} from "react-hook-form";
import { getRuleValue } from "../../utils/getRuleValue";
import { FormLabel } from "../FormLabel";
import {
    OptionType,
    SelectControlOption,
    SelectControlProps,
    SelectVariant,
    isSelectBasedOptions,
    isString,
    key
} from "./SelectControl";

const getValue = (option: SelectControlOption | string) =>
    isString(option) ? option : option.value;

export const TypeaheadSelectControl = <
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
    placeholderText,
    onFilter,
    variant,
    isDisabled,
    ...rest
}: SelectControlProps<T, P>) => {
    const {
        control,
        formState: { errors }
    } = useFormContext();
    const [open, setOpen] = useState(false);
    const [filterValue, setFilterValue] = useState("");
    const textInputRef = useRef<HTMLInputElement>(null);
    const required = getRuleValue(controller.rules?.required) === true;
    const isTypeaheadMulti = variant === SelectVariant.typeaheadMulti;

    const combinedOptions = useMemo(
        () =>
            [
                ...(Array.isArray(options) ? options : []).filter(
                    o => !(selectedOptions || []).map((s: SelectControlOption | string) => getValue(s)).includes(getValue(o))
                ),
                ...(selectedOptions || [])
            ] as OptionType,
        [selectedOptions, options]
    );

    const filteredOptions = useMemo(
        () =>
            combinedOptions.filter(option =>
                getValue(option).toLowerCase().includes(filterValue.toLowerCase())
            ),
        [combinedOptions, filterValue]
    );

    const updateValue = (
        option: string,
        field: ControllerRenderProps<FieldValues, string>
    ) => {
        const current = Array.isArray(field.value) ? field.value : [];
        if (current.includes(option)) {
            field.onChange(current.filter((item: string) => item !== option));
        } else {
            field.onChange([...current, option]);
        }
    };

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
                render={({ field }) => (
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <div
                                ref={rest as unknown as React.RefObject<HTMLDivElement>}
                                id={id || name}
                                role="combobox"
                                aria-expanded={open}
                                aria-invalid={!!get(errors, name)}
                                aria-label={label}
                                className="border-input focus-within:ring-ring flex min-h-9 w-full flex-wrap items-center gap-1 rounded-md border bg-transparent px-2 py-1.5 text-sm shadow-xs focus-within:ring-2"
                            >
                                {isTypeaheadMulti && Array.isArray(field.value) && field.value.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {field.value.map((selection: string, index: number) => {
                                            const opt = combinedOptions.find(o => key(o) === selection);
                                            const display = isSelectBasedOptions(combinedOptions) ? (opt as SelectControlOption)?.value : selection;
                                            return (
                                                <Badge
                                                    key={index}
                                                    variant="secondary"
                                                    className="cursor-pointer gap-0.5 py-0 pr-1"
                                                    onClick={ev => {
                                                        ev.stopPropagation();
                                                        field.onChange(field.value.filter((item: string) => item !== selection));
                                                    }}
                                                >
                                                    {display}
                                                    <X className="size-3" aria-hidden />
                                                </Badge>
                                            );
                                        })}
                                    </div>
                                )}
                                <Input
                                    ref={textInputRef}
                                    value={filterValue}
                                    onChange={e => {
                                        setFilterValue(e.target.value);
                                        onFilter?.(e.target.value);
                                    }}
                                    onFocus={() => setOpen(true)}
                                    placeholder={placeholderText}
                                    autoComplete="off"
                                    disabled={isDisabled}
                                    className="min-w-24 flex-1 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
                                />
                                {(filterValue || (Array.isArray(field.value) ? field.value.length > 0 : field.value)) && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="size-6 shrink-0"
                                        onClick={() => {
                                            setFilterValue("");
                                            field.onChange(isTypeaheadMulti ? [] : "");
                                            textInputRef?.current?.focus();
                                        }}
                                        aria-label="Clear"
                                    >
                                        <X className="size-4" aria-hidden />
                                    </Button>
                                )}
                            </div>
                        </PopoverTrigger>
                        <PopoverContent
                            id="select-typeahead-listbox"
                            className="max-h-64 w-[var(--radix-popover-trigger-width)] overflow-auto p-0"
                            align="start"
                        >
                            <ul className="flex flex-col py-1" role="listbox">
                                {filteredOptions.map(option => {
                                    const optKey = key(option);
                                    const optVal = getValue(option);
                                    const isSelected = Array.isArray(field.value) && field.value.includes(optKey);
                                    return (
                                        <li
                                            key={optKey}
                                            role="option"
                                            aria-selected={isSelected}
                                            className="hover:bg-accent focus:bg-accent cursor-pointer px-2 py-1.5 text-sm outline-none"
                                            onMouseDown={e => e.preventDefault()}
                                            onClick={() => {
                                                if (isTypeaheadMulti) {
                                                    setFilterValue("");
                                                    updateValue(optKey, field);
                                                } else {
                                                    field.onChange(optKey);
                                                    setOpen(false);
                                                }
                                            }}
                                        >
                                            {optVal}
                                        </li>
                                    );
                                })}
                            </ul>
                        </PopoverContent>
                    </Popover>
                )}
            />
        </FormLabel>
    );
};
