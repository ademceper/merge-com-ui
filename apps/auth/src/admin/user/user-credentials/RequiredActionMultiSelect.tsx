import type RequiredActionProviderRepresentation from "@keycloak/keycloak-admin-client/lib/defs/requiredActionProviderRepresentation";
import { FormLabel, useFetch } from "../../../shared/keycloak-ui-shared";
import { Button } from "@merge/ui/components/button";
import { Popover, PopoverContent, PopoverTrigger } from "@merge/ui/components/popover";
import { get } from "lodash-es";
import { useState } from "react";
import { Controller, FieldPathByValue, FieldValues, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../../admin-client";

export type RequiredActionMultiSelectProps<
    T extends FieldValues,
    P extends FieldPathByValue<T, string[] | undefined>
> = {
    name: P;
    label: string;
    help: string;
};

export const RequiredActionMultiSelect = <
    T extends FieldValues,
    P extends FieldPathByValue<T, string[] | undefined>
>({
    name,
    label,
    help
}: RequiredActionMultiSelectProps<T, P>) => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const [requiredActions, setRequiredActions] = useState<
        RequiredActionProviderRepresentation[]
    >([]);

    useFetch(
        () => adminClient.authenticationManagement.getRequiredActions(),
        actions => {
            const enabledUserActions = actions.filter(action => {
                return action.enabled;
            });
            setRequiredActions(enabledUserActions);
        },
        []
    );

    const { control, formState: { errors } } = useFormContext();
    const [open, setOpen] = useState(false);
    const options = requiredActions.map(({ alias, name: n }) => ({ key: alias!, value: n || alias! }));
    return (
        <FormLabel name={name as string} label={t(label)} labelIcon={t(help)} error={get(errors, name as string)}>
            <Controller
                name={name}
                control={control}
                defaultValue={[]}
                render={({ field }) => (
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button variant="outline" role="combobox" aria-expanded={open} className="min-h-9 w-full justify-between font-normal">
                                <span className="truncate">
                                    {(field.value ?? []).length > 0
                                        ? (field.value ?? []).map((id: string) => options.find((o) => o.key === id)?.value ?? id).join(", ")
                                        : t("requiredActionPlaceholder")}
                                </span>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
                            <ul className="max-h-[375px] overflow-auto py-1">
                                {options.map((opt) => {
                                    const selected = (field.value ?? []).includes(opt.key);
                                    return (
                                        <li
                                            key={opt.key}
                                            role="option"
                                            aria-selected={selected}
                                            className="hover:bg-accent cursor-pointer px-2 py-1.5 text-sm"
                                            onMouseDown={(e) => e.preventDefault()}
                                            onClick={() => {
                                                if (selected) field.onChange((field.value ?? []).filter((x: string) => x !== opt.key));
                                                else field.onChange([...(field.value ?? []), opt.key]);
                                            }}
                                        >
                                            {opt.value}
                                        </li>
                                    );
                                })}
                            </ul>
                            {(field.value ?? []).length > 0 && (
                                <div className="border-t px-2 py-1">
                                    <Button type="button" variant="ghost" size="sm" className="h-7 w-full justify-center" onClick={() => { field.onChange([]); setOpen(false); }}>
                                        {t("clear")}
                                    </Button>
                                </div>
                            )}
                        </PopoverContent>
                    </Popover>
                )}
            />
        </FormLabel>
    );
};
