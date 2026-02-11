import type ScopeRepresentation from "@keycloak/keycloak-admin-client/lib/defs/scopeRepresentation";
import { useFetch } from "../../../shared/keycloak-ui-shared";
import { Button } from "@merge/ui/components/button";
import { Input } from "@merge/ui/components/input";
import { Popover, PopoverContent, PopoverTrigger } from "@merge/ui/components/popover";
import { useRef, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../../admin-client";

type ScopeSelectProps = {
    clientId: string;
    resourceId?: string;
    preSelected?: string;
};

export const ScopeSelect = ({ clientId, resourceId, preSelected }: ScopeSelectProps) => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();

    const {
        control,
        getValues,
        setValue,
        formState: { errors }
    } = useFormContext();

    const [scopes, setScopes] = useState<ScopeRepresentation[]>([]);
    const [selectedScopes, setSelectedScopes] = useState<ScopeRepresentation[]>([]);
    const [search, setSearch] = useState("");
    const [open, setOpen] = useState(false);
    const firstUpdate = useRef(true);

    const values: string[] | undefined = getValues("scopes");

    useFetch(
        async (): Promise<ScopeRepresentation[]> => {
            if (!resourceId) {
                return adminClient.clients.listAllScopes(
                    Object.assign(
                        { id: clientId, deep: false },
                        search === "" ? null : { name: search }
                    )
                );
            }

            if (resourceId && !firstUpdate.current) {
                setValue("scopes", []);
            }

            firstUpdate.current = false;
            return adminClient.clients.listScopesByResource({
                id: clientId,
                resourceName: resourceId
            });
        },
        scopes => {
            setScopes(scopes);
            if (!search)
                setSelectedScopes(
                    scopes.filter((s: ScopeRepresentation) => values?.includes(s.id!))
                );
        },
        [resourceId, search]
    );

    return (
        <Controller
            name="scopes"
            defaultValue={preSelected ? [preSelected] : []}
            control={control}
            rules={{ validate: value => value.length > 0 }}
            render={({ field }) => (
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            id="scopes"
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            aria-invalid={!!errors.scopes}
                            disabled={!!preSelected}
                            className="min-h-9 w-full justify-between font-normal"
                        >
                            <span className="truncate">
                                {selectedScopes.length > 0
                                    ? selectedScopes.map((s) => s.name).join(", ")
                                    : t("scopes")}
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
                            {scopes.map((scope) => {
                                const isSelected = selectedScopes.some((p) => p.id === scope.id);
                                return (
                                    <li
                                        key={scope.id}
                                        role="option"
                                        aria-selected={isSelected}
                                        className="hover:bg-accent cursor-pointer px-2 py-1.5 text-sm"
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => {
                                            const changedValue = isSelected
                                                ? selectedScopes.filter((p) => p.id !== scope.id)
                                                : [...selectedScopes, scope];
                                            field.onChange(changedValue.map((s) => s.id));
                                            setSelectedScopes(changedValue);
                                        }}
                                    >
                                        {scope.name}
                                    </li>
                                );
                            })}
                        </ul>
                        {selectedScopes.length > 0 && (
                            <div className="border-t px-2 py-1">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-full justify-center"
                                    onClick={() => {
                                        field.onChange([]);
                                        setSelectedScopes([]);
                                        setSearch("");
                                        setOpen(false);
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
    );
};
