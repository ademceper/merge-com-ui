import { Switch } from "@merge/ui/components/switch";
import { Label } from "@merge/ui/components/label";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { HelpItem } from "../../../shared/keycloak-ui-shared";
import type { ComponentProps } from "./components";

export const BooleanComponent = ({
    name,
    label,
    helpText,
    isDisabled = false,
    defaultValue,
    isNew = true,
    convertToName,
    booleanLabelTextSwitchHelp = false
}: ComponentProps) => {
    const { t } = useTranslation();
    const { control } = useFormContext();

    const isOn = (value: unknown) =>
        value === "true" || value === true || value?.[0] === "true";

    return (
        <div className="space-y-2">
            {booleanLabelTextSwitchHelp ? (
                <Controller
                    name={convertToName(name!)}
                    data-testid={name}
                    defaultValue={isNew ? defaultValue : false}
                    control={control}
                    render={({ field }) => (
                        <div className="flex items-center justify-between gap-2">
                            <Label htmlFor={name!}>{t(label!)}</Label>
                            <div className="flex items-center gap-2">
                                <span className="text-sm">
                                    {isOn(field.value) ? t("on") : t("off")}
                                </span>
                                <Switch
                                    id={name!}
                                    disabled={isDisabled}
                                    checked={isOn(field.value)}
                                    onCheckedChange={(value) => field.onChange("" + value)}
                                    data-testid={name}
                                    aria-label={t(label!)}
                                />
                                {helpText && (
                                    <HelpItem helpText={t(helpText)} fieldLabelId={`${label}`} />
                                )}
                            </div>
                        </div>
                    )}
                />
            ) : (
                <>
                    <div className="flex items-center gap-1">
                        <Label htmlFor={name!}>{t(label!)}</Label>
                        <HelpItem helpText={t(helpText!)} fieldLabelId={`${label}`} />
                    </div>
                    <Controller
                        name={convertToName(name!)}
                        data-testid={name}
                        defaultValue={isNew ? defaultValue : false}
                        control={control}
                        render={({ field }) => (
                            <div className="flex items-center gap-2">
                                <Switch
                                    id={name!}
                                    disabled={isDisabled}
                                    checked={isOn(field.value)}
                                    onCheckedChange={(value) => field.onChange("" + value)}
                                    data-testid={name}
                                    aria-label={t(label!)}
                                />
                                <span className="text-sm">
                                    {isOn(field.value) ? t("on") : t("off")}
                                </span>
                            </div>
                        )}
                    />
                </>
            )}
        </div>
    );
};
