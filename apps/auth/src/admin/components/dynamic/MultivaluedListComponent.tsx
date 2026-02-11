import { FormErrorText, HelpItem, SelectVariant } from "../../../shared/keycloak-ui-shared";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@merge/ui/components/select";
import { Button } from "@merge/ui/components/button";
import { Label } from "@merge/ui/components/label";
import { Popover, PopoverContent, PopoverTrigger } from "@merge/ui/components/popover";
import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { ComponentProps } from "./components";

function stringToMultiline(value?: string): string[] {
    return typeof value === "string" && value.length > 0 ? value.split("##") : [];
}

function toStringValue(formValue: string[]): string {
    return formValue.join("##");
}

type MultiValuedListComponentProps = ComponentProps & {
    variant?: `${SelectVariant}`;
};

export const MultiValuedListComponent = ({
    name,
    label,
    helpText,
    defaultValue,
    options,
    isDisabled = false,
    stringify,
    required,
    convertToName,
    onSearch,
    variant = SelectVariant.typeaheadMulti,
    hideLabel = false,
    helpIconAfterControl = false
}: MultiValuedListComponentProps) => {
    const { t } = useTranslation();
    const {
        control,
        formState: { errors }
    } = useFormContext();
    const [open, setOpen] = useState(false);

    function setSearch(value: string) {
        if (onSearch) {
            onSearch(value);
        }
    }

    const convertedName = convertToName(name!);

    const getError = () => {
        return convertedName
            .split(".")
            .reduce((record: any, key) => record?.[key], errors);
    };

    return (
        <div className="space-y-2">
            {!(hideLabel && helpIconAfterControl) && (
                <div className="flex items-center gap-1">
                    {!hideLabel && (
                        <Label htmlFor={name!}>{t(label!)}{required && " *"}</Label>
                    )}
                    {!helpIconAfterControl && helpText && (
                        <HelpItem helpText={t(helpText!)} fieldLabelId={`${label}`} />
                    )}
                </div>
            )}
            <Controller
                name={convertedName}
                control={control}
                defaultValue={
                    stringify || variant !== SelectVariant.typeaheadMulti
                        ? defaultValue || ""
                        : defaultValue
                          ? [defaultValue]
                          : []
                }
                rules={{
                    required: { value: required || false, message: t("required") }
                }}
                render={({ field }) => (
                    <div className={helpIconAfterControl ? "flex w-full items-center gap-2" : undefined}>
                        {variant === SelectVariant.typeaheadMulti ? (
                            <Popover open={open} onOpenChange={setOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        id={name}
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={open}
                                        disabled={isDisabled}
                                        className={`min-h-9 w-full justify-between font-normal ${helpIconAfterControl ? "flex-1 min-w-0" : ""}`}
                                        data-testid={name}
                                    >
                                        <span className="truncate">
                                            {(stringify ? stringToMultiline(field.value) : field.value)?.length > 0
                                                ? (stringify ? stringToMultiline(field.value) : field.value).join(", ")
                                                : t("choose")}
                                        </span>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
                                    <ul className="max-h-64 overflow-auto py-1">
                                        {(options ?? []).map((option) => {
                                            const values = stringify ? stringToMultiline(field.value) : (field.value ?? []);
                                            const selected = values.includes(option);
                                            return (
                                                <li
                                                    key={option}
                                                    role="option"
                                                    aria-selected={selected}
                                                    className="hover:bg-accent cursor-pointer px-2 py-1.5 text-sm"
                                                    onMouseDown={(e) => e.preventDefault()}
                                                    onClick={() => {
                                                        if (selected) {
                                                            const newVal = values.filter((x: string) => x !== option);
                                                            field.onChange(stringify ? toStringValue(newVal) : newVal);
                                                        } else {
                                                            const newVal = [...values, option];
                                                            field.onChange(stringify ? toStringValue(newVal) : newVal);
                                                        }
                                                    }}
                                                >
                                                    {option}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                    {((stringify ? stringToMultiline(field.value) : field.value) ?? []).length > 0 && (
                                        <div className="border-t px-2 py-1">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 w-full justify-center"
                                                onClick={() => field.onChange(stringify ? "" : [])}
                                            >
                                                {t("clear")}
                                            </Button>
                                        </div>
                                    )}
                                </PopoverContent>
                            </Popover>
                        ) : (
                            <Select
                                open={open}
                                onOpenChange={setOpen}
                                value={(stringify ? (field.value ?? "") : (Array.isArray(field.value) ? field.value[0] : field.value)) ?? ""}
                                onValueChange={(v) => {
                                    field.onChange(v);
                                    setOpen(false);
                                }}
                                disabled={isDisabled}
                            >
                                <SelectTrigger
                                    id={name}
                                    className={helpIconAfterControl ? "flex-1 min-w-0" : undefined}
                                    data-testid={name}
                                >
                                    <SelectValue placeholder={t("choose")} />
                                </SelectTrigger>
                                <SelectContent>
                                    {(options ?? []).map((option) => (
                                        <SelectItem key={option} value={option}>
                                            {option}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                        {helpIconAfterControl && helpText && (
                            <HelpItem helpText={t(helpText)} fieldLabelId={`${label}`} />
                        )}
                        {getError() && <FormErrorText message={getError().message} />}
                    </div>
                )}
            />
        </div>
    );
};
