import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@merge/ui/components/select";
import { Popover, PopoverContent, PopoverTrigger } from "@merge/ui/components/popover";
import { Button } from "@merge/ui/components/button";
import { useState } from "react";
import { Controller } from "react-hook-form";
import { OptionLabel, Options, UserProfileFieldProps } from "./UserProfileFields";
import { UserProfileGroup } from "./UserProfileGroup";
import { fieldName, label } from "./utils";

export const SelectComponent = (props: UserProfileFieldProps) => {
    const { t, form, inputType, attribute } = props;
    const [open, setOpen] = useState(false);
    const [multiOpen, setMultiOpen] = useState(false);
    const isMultiValue = inputType === "multiselect";

    const options = (attribute.validators?.options as Options | undefined)?.options || [];

    const optionLabel =
        (attribute.annotations?.["inputOptionLabels"] as OptionLabel) || {};
    const prefix = attribute.annotations?.["inputOptionLabelsI18nPrefix"] as string;

    const fetchLabel = (option: string) =>
        label(props.t, optionLabel[option], option, prefix);

    if (isMultiValue) {
        return (
            <UserProfileGroup {...props}>
                <Controller
                    name={fieldName(attribute.name)}
                    defaultValue={attribute.defaultValue ?? []}
                    control={form.control}
                    render={({ field }) => (
                        <Popover open={multiOpen} onOpenChange={setMultiOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    id={attribute.name}
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={multiOpen}
                                    disabled={attribute.readOnly}
                                    className="min-h-9 w-full justify-between font-normal"
                                >
                                    <span className="truncate">
                                        {Array.isArray(field.value) && field.value.length > 0
                                            ? field.value.map((opt) => fetchLabel(opt)).join(", ")
                                            : t("selectOne")}
                                    </span>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-(--radix-popover-trigger-width) p-0"
                                align="start"
                            >
                                <ul className="max-h-64 overflow-auto py-1">
                                    {options.map((option) => {
                                        const selected = Array.isArray(field.value) && field.value.includes(option);
                                        return (
                                            <li
                                                key={option}
                                                role="option"
                                                aria-selected={selected}
                                                className="hover:bg-accent cursor-pointer px-2 py-1.5 text-sm"
                                                onMouseDown={(e) => e.preventDefault()}
                                                onClick={() => {
                                                    if (selected) {
                                                        field.onChange(field.value.filter((x: string) => x !== option));
                                                    } else {
                                                        field.onChange([...(field.value || []), option]);
                                                    }
                                                }}
                                            >
                                                {fetchLabel(option)}
                                            </li>
                                        );
                                    })}
                                </ul>
                                {Array.isArray(field.value) && field.value.length > 0 && (
                                    <div className="border-t px-2 py-1">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 w-full justify-center"
                                            onClick={() => {
                                                field.onChange([]);
                                                setMultiOpen(false);
                                            }}
                                        >
                                            {t("clear")}
                                        </Button>
                                    </div>
                                )}
                            </PopoverContent>
                        </Popover>
                    )}
                />
            </UserProfileGroup>
        );
    }

    return (
        <UserProfileGroup {...props}>
            <Controller
                name={fieldName(attribute.name)}
                defaultValue={attribute.defaultValue}
                control={form.control}
                render={({ field }) => (
                    <Select
                        open={open}
                        onOpenChange={setOpen}
                        value={field.value ?? ""}
                        onValueChange={(v) => {
                            field.onChange(v);
                            setOpen(false);
                        }}
                        disabled={attribute.readOnly}
                        aria-label={t("selectOne")}
                    >
                        <SelectTrigger id={attribute.name}>
                            <SelectValue placeholder={t("selectOne")} />
                        </SelectTrigger>
                        <SelectContent>
                            {options.map((option) => (
                                <SelectItem key={option} value={option}>
                                    {fetchLabel(option)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            />
        </UserProfileGroup>
    );
};
