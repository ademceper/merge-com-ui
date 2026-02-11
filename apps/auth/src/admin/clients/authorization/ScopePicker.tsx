import type ScopeRepresentation from "@keycloak/keycloak-admin-client/lib/defs/scopeRepresentation";
import { FormErrorText, HelpItem, KeycloakSpinner, useFetch } from "../../../shared/keycloak-ui-shared";
import { Button } from "@merge/ui/components/button";
import { Input } from "@merge/ui/components/input";
import { Label } from "@merge/ui/components/label";
import { Popover, PopoverContent, PopoverTrigger } from "@merge/ui/components/popover";
import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../../admin-client";
import { useIsAdminPermissionsClient } from "../../utils/useIsAdminPermissionsClient";

type Scope = {
    id: string;
    name: string;
};

type ScopePickerProps = {
    clientId: string;
    resourceTypeScopes?: string[];
};

export const ScopePicker = ({ clientId, resourceTypeScopes }: ScopePickerProps) => {
    const { adminClient } = useAdminClient();
    const { t } = useTranslation();
    const {
        control,
        formState: { errors }
    } = useFormContext();
    const [open, setOpen] = useState(false);
    const [scopes, setScopes] = useState<ScopeRepresentation[]>();
    const [search, setSearch] = useState("");
    const isAdminPermissionsClient = useIsAdminPermissionsClient(clientId);

    useFetch(
        () => {
            const params = {
                id: clientId,
                first: 0,
                max: 20,
                deep: false,
                name: search
            };
            return adminClient.clients.listAllScopes(params);
        },
        setScopes,
        [search]
    );

    if (!scopes && !resourceTypeScopes) return <KeycloakSpinner />;

    const allScopes: string[] =
        isAdminPermissionsClient && resourceTypeScopes
            ? resourceTypeScopes
            : (scopes?.map((scope) => scope.name!) ?? []);

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <Label>{t("authorizationScopes")}</Label>
                <HelpItem helpText={t("clientScopesHelp")} fieldLabelId="scopes" />
            </div>
            <Controller
                name="scopes"
                defaultValue={[]}
                control={control}
                rules={isAdminPermissionsClient ? { required: t("requiredField") } : {}}
                render={({ field }) => {
                    const selectedValues = (field.value ?? []).map((o: Scope) => o.name);
                    const filteredScopes = search
                        ? allScopes.filter((name) => name.toLowerCase().includes(search.toLowerCase()))
                        : allScopes;
                    return (
                        <>
                            <Popover open={open} onOpenChange={setOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        id="scopes"
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={open}
                                        aria-invalid={!!errors.scopes}
                                        className="min-h-9 w-full justify-between font-normal"
                                    >
                                        <span className="truncate">
                                            {selectedValues.length > 0
                                                ? selectedValues.join(", ")
                                                : t("authorizationScopes")}
                                        </span>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
                                    <Input
                                        placeholder={t("filter")}
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="m-2 h-8"
                                    />
                                    <ul className="max-h-64 overflow-auto py-1">
                                        {filteredScopes.map((name) => {
                                            const isSelected = selectedValues.includes(name);
                                            return (
                                                <li
                                                    key={name}
                                                    role="option"
                                                    aria-selected={isSelected}
                                                    className="hover:bg-accent cursor-pointer px-2 py-1.5 text-sm"
                                                    onMouseDown={(e) => e.preventDefault()}
                                                    onClick={() => {
                                                        const changedValue = isSelected
                                                            ? field.value.filter((o: Scope) => o.name !== name)
                                                            : [...(field.value ?? []), { name }];
                                                        field.onChange(changedValue);
                                                    }}
                                                >
                                                    {name}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                    {selectedValues.length > 0 && (
                                        <div className="border-t px-2 py-1">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 w-full justify-center"
                                                onClick={() => {
                                                    setSearch("");
                                                    field.onChange([]);
                                                    setOpen(false);
                                                }}
                                            >
                                                {t("clear")}
                                            </Button>
                                        </div>
                                    )}
                                </PopoverContent>
                            </Popover>
                            {isAdminPermissionsClient && errors.scopes && (
                                <FormErrorText message={t("required")} />
                            )}
                        </>
                    );
                }}
            />
        </div>
    );
};
