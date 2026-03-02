import { useMemo } from "react";
import { FormProvider, Controller, useFormContext } from "react-hook-form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@merge/ui/components/select";
import { UserProfileFieldProps } from "./UserProfileFields";

const localeToDisplayName = (locale: string) => {
    try {
        return new Intl.DisplayNames([locale], { type: "language" }).of(locale);
    } catch {
        return locale;
    }
};

type LocaleSelectorProps = Omit<UserProfileFieldProps, "inputType"> & {
    supportedLocales: string[];
    currentLocale: string;
};

export const LocaleSelector = ({
    t,
    form,
    supportedLocales,
    currentLocale
}: LocaleSelectorProps) => {
    const locales = useMemo(
        () =>
            supportedLocales
                .map(locale => ({
                    key: locale,
                    value: t(`locale_${locale}`, localeToDisplayName(locale) ?? locale)
                }))
                .sort((a, b) => a.value.localeCompare(b.value, currentLocale)),
        [supportedLocales, currentLocale, t]
    );

    if (!locales.length) {
        return null;
    }
    const options = locales;
    return (
        <FormProvider {...form}>
            <LocaleSelectInner t={t} options={options} />
        </FormProvider>
    );
};

function LocaleSelectInner({ t, options }: { t: UserProfileFieldProps["t"]; options: { key: string; value: string }[] }) {
    const { control } = useFormContext();
    return (
        <Controller
            name="attributes.locale"
            control={control}
            defaultValue=""
            render={({ field }) => {
                const val = Array.isArray(field.value) ? field.value[0] : field.value;
                return (
                <Select
                    value={val || undefined}
                    onValueChange={(v) => field.onChange(v)}
                >
                    <SelectTrigger id="attributes.locale" data-testid="locale-select" className="h-12 rounded-lg bg-muted border-0">
                        <SelectValue placeholder={t("selectALocale")} />
                    </SelectTrigger>
                    <SelectContent>
                        {options.map((opt) => (
                            <SelectItem key={opt.key} value={opt.key}>
                                {opt.value}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                );
            }}
        />
    );
}
