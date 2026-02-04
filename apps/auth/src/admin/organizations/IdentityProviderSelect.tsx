import IdentityProviderRepresentation from "@keycloak/keycloak-admin-client/lib/defs/identityProviderRepresentation";
import { IdentityProvidersQuery } from "@keycloak/keycloak-admin-client/lib/resources/identityProviders";
import { FormErrorText, HelpItem, useFetch } from "../../shared/keycloak-ui-shared";
import { Button } from "@merge/ui/components/button";
import { Badge } from "@merge/ui/components/badge";
import { Label } from "@merge/ui/components/label";
import { Input } from "@merge/ui/components/input";
import { Popover, PopoverContent, PopoverTrigger } from "@merge/ui/components/popover";
import { X } from "@phosphor-icons/react";
import { debounce } from "lodash-es";
import { useCallback, useRef, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../admin-client";
import { ComponentProps } from "../components/dynamic/components";
import { KeycloakSpinner } from "../../shared/keycloak-ui-shared";
import useToggle from "../utils/useToggle";

type IdentityProviderSelectProps = Omit<ComponentProps, "convertToName"> & {
    variant?: "typeaheadMulti" | "typeahead";
    isRequired?: boolean;
};

export const IdentityProviderSelect = ({
    name,
    label,
    helpText,
    defaultValue,
    isRequired,
    variant = "typeahead",
    isDisabled
}: IdentityProviderSelectProps) => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const {
        control,
        getValues,
        formState: { errors }
    } = useFormContext();
    const values: string[] | undefined = getValues(name!);

    const [open, toggleOpen, setOpen] = useToggle(false);
    const [inputValue, setInputValue] = useState("");
    const textInputRef = useRef<HTMLInputElement | null>(null);
    const [idps, setIdps] = useState<(IdentityProviderRepresentation | undefined)[]>([]);
    const [search, setSearch] = useState("");

    const debounceFn = useCallback(debounce(setSearch, 1000), []);

    useFetch(
        async () => {
            const params: IdentityProvidersQuery = {
                max: 20,
                realmOnly: true
            };
            if (search) {
                params.search = search;
            }

            return await adminClient.identityProviders.find(params);
        },
        setIdps,
        [search]
    );

    if (!idps) {
        return <KeycloakSpinner />;
    }
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-1">
                <Label htmlFor={name!}>
                    {t(label!)}{isRequired && " *"}
                </Label>
                {helpText && <HelpItem helpText={helpText!} fieldLabelId={label!} />}
            </div>
            <Controller
                name={name!}
                defaultValue={defaultValue}
                control={control}
                rules={{
                    validate: (value: string[]) =>
                        isRequired && value.filter(i => i !== undefined).length === 0
                            ? t("required")
                            : undefined
                }}
                render={({ field }) => (
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <div
                                data-testid={name!}
                                className={`flex items-center border rounded-md px-3 py-2 cursor-pointer w-full ${errors[name!] ? "border-red-500" : ""} ${isDisabled ? "opacity-50 pointer-events-none" : ""}`}
                                onClick={toggleOpen}
                            >
                                <div className="flex-1 flex flex-wrap gap-1">
                                    {variant === "typeaheadMulti" && Array.isArray(field.value) && field.value.map((selection: string, index: number) => (
                                        <Badge key={index} variant="secondary" className="cursor-pointer" onClick={ev => {
                                            ev.stopPropagation();
                                            field.onChange(field.value.filter((item: string) => item !== selection));
                                        }}>
                                            {selection} <X className="size-3 ml-1 inline" />
                                        </Badge>
                                    ))}
                                    <Input
                                        ref={textInputRef}
                                        value={inputValue || (variant !== "typeaheadMulti" ? field.value?.[0] || "" : "")}
                                        onChange={(e) => {
                                            setOpen(true);
                                            setInputValue(e.target.value);
                                            debounceFn(e.target.value);
                                        }}
                                        onClick={(e) => { e.stopPropagation(); setOpen(true); }}
                                        autoComplete="off"
                                        placeholder={t("selectAUser")}
                                        className="border-0 p-0 h-auto focus-visible:ring-0 shadow-none"
                                    />
                                </div>
                                {!!search && (
                                    <Button
                                        variant="ghost"
                                        className="h-auto p-1"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setInputValue("");
                                            setSearch("");
                                            field.onChange([]);
                                            textInputRef?.current?.focus();
                                        }}
                                        aria-label={t("clear")}
                                    >
                                        <X className="size-4" aria-hidden />
                                    </Button>
                                )}
                            </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                            <div className="max-h-60 overflow-auto">
                                {idps.length === 0 ? (
                                    <div className="px-3 py-2 text-sm text-muted-foreground">{t("noResultsFound")}</div>
                                ) : (
                                    idps.map(option => (
                                        <div
                                            key={option!.alias}
                                            className={`px-3 py-2 text-sm cursor-pointer hover:bg-muted ${values?.includes(option!.alias!) ? "bg-muted" : ""}`}
                                            onClick={() => {
                                                const alias = option!.alias!;
                                                if (variant !== "typeaheadMulti") {
                                                    const removed = field.value.includes(alias);
                                                    field.onChange(removed ? [] : [alias]);
                                                    setInputValue(removed ? "" : alias);
                                                    setOpen(false);
                                                } else {
                                                    const changedValue = field.value.find((v: string) => v === alias)
                                                        ? field.value.filter((v: string) => v !== alias)
                                                        : [...field.value, alias];
                                                    field.onChange(changedValue);
                                                }
                                            }}
                                        >
                                            {option!.alias}
                                        </div>
                                    ))
                                )}
                            </div>
                        </PopoverContent>
                    </Popover>
                )}
            />
            {errors[name!] && <FormErrorText message={t("required")} />}
        </div>
    );
};
