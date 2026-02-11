import { HelpItem } from "../../../shared/keycloak-ui-shared";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@merge/ui/components/select";
import { Label } from "@merge/ui/components/label";
import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { ComponentProps } from "./components";

export const ListComponent = ({
    name,
    label,
    helpText,
    defaultValue,
    options,
    required,
    isDisabled = false,
    convertToName,
    hideLabel = false,
    helpIconAfterControl = false
}: ComponentProps) => {
    const { t } = useTranslation();
    const { control } = useFormContext();
    const [open, setOpen] = useState(false);

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
                name={convertToName(name!)}
                data-testid={name}
                defaultValue={defaultValue || options?.[0] || ""}
                control={control}
                render={({ field }) => (
                    <div className={helpIconAfterControl ? "flex w-full items-center gap-2" : undefined}>
                        <Select
                            open={open}
                            onOpenChange={setOpen}
                            value={field.value ?? ""}
                            onValueChange={(v) => {
                                field.onChange(v);
                                setOpen(false);
                            }}
                            disabled={isDisabled}
                            aria-label={hideLabel ? t(label!) : undefined}
                        >
                            <SelectTrigger
                                id={name}
                                className={helpIconAfterControl ? "flex-1 min-w-0" : undefined}
                            >
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {options?.map(option => (
                                    <SelectItem key={option} value={option}>
                                        {option}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {helpIconAfterControl && helpText && (
                            <HelpItem helpText={t(helpText)} fieldLabelId={`${label}`} />
                        )}
                    </div>
                )}
            />
        </div>
    );
};
