import {
    HelpItem,
    KeycloakSelect,
    SelectVariant
} from "../../../shared/keycloak-ui-shared";
import { Label } from "@merge/ui/components/label";
import { SelectOption } from "../../../shared/keycloak-ui-shared";
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
                        <KeycloakSelect
                            toggleId={name}
                            isDisabled={isDisabled}
                            onToggle={toggle => setOpen(toggle)}
                            onSelect={value => {
                                field.onChange(value as string);
                                setOpen(false);
                            }}
                            selections={field.value}
                            variant={SelectVariant.single}
                            aria-label={hideLabel ? t(label!) : undefined}
                            isOpen={open}
                            className={helpIconAfterControl ? "flex-1 min-w-0" : undefined}
                        >
                            {options?.map(option => (
                                <SelectOption
                                    key={option}
                                    value={option}
                                >
                                    {option}
                                </SelectOption>
                            ))}
                        </KeycloakSelect>
                        {helpIconAfterControl && helpText && (
                            <HelpItem helpText={t(helpText)} fieldLabelId={`${label}`} />
                        )}
                    </div>
                )}
            />
        </div>
    );
};
