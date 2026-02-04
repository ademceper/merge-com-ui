import type UserRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userRepresentation";
import { FormLabel, useFetch } from "../../../shared/keycloak-ui-shared";
import { Button } from "@merge/ui/components/button";
import { Input } from "@merge/ui/components/input";
import { Badge } from "@merge/ui/components/badge";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@merge/ui/components/popover";
import { X } from "@phosphor-icons/react";
import { debounce } from "lodash-es";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../../admin-client";
import useToggle from "../../utils/useToggle";
import type { ComponentProps } from "../dynamic/components";

type UserSelectVariant = "typeaheadMulti" | "typeahead";

type UserSelectProps = Omit<ComponentProps, "convertToName"> & {
    variant?: UserSelectVariant;
    isRequired?: boolean;
};

export const UserSelect = ({
    name,
    label,
    helpText,
    defaultValue,
    isRequired,
    variant = "typeaheadMulti"
}: UserSelectProps) => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const {
        control,
        getValues,
        formState: { errors }
    } = useFormContext();
    const values: string[] | undefined = getValues(name!);

    const [open, _toggleOpen, setOpen] = useToggle();
    const [selectedUsers, setSelectedUsers] = useState<UserRepresentation[]>([]);
    const [searchedUsers, setSearchedUsers] = useState<UserRepresentation[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [search, setSearch] = useState("");
    const textInputRef = useRef<HTMLInputElement>(null);

    const debounceFn = useCallback(debounce(setSearch, 500), []);

    useFetch(
        async () => {
            if (!values) {
                return [];
            }

            const foundUsers = await Promise.all(
                values.map(id => adminClient.users.findOne({ id }))
            );

            return foundUsers.filter(user => user !== undefined);
        },
        users => {
            setSelectedUsers(users);
            if (variant !== "typeaheadMulti") {
                setInputValue(users[0]?.username || "");
            }
        },
        [values]
    );

    useFetch(
        async () =>
            adminClient.users.find({
                username: search,
                max: 20
            }),
        setSearchedUsers,
        [search]
    );

    useEffect(() => {
        if (!values || values.length === 0) {
            setSelectedUsers([]);
            setInputValue("");
        }
    }, [values]);

    const users = useMemo(
        () => [...selectedUsers, ...searchedUsers],
        [selectedUsers, searchedUsers]
    );

    return (
        <FormLabel
            name={name!}
            label={t(label!)}
            isRequired={isRequired}
            labelIcon={helpText!}
            error={errors[name!]}
        >
            <Controller
                name={name!}
                defaultValue={defaultValue}
                control={control}
                rules={
                    isRequired && variant === "typeaheadMulti"
                        ? { validate: value => value.length > 0 }
                        : { required: isRequired }
                }
                render={({ field }) => (
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <div
                                data-testid={name!}
                                role="combobox"
                                aria-expanded={open}
                                aria-controls="select-create-typeahead-listbox"
                                aria-label={t(name!)}
                                className="border-input focus-within:ring-ring flex min-h-9 w-full flex-wrap items-center gap-1 rounded-md border bg-transparent px-2 py-1.5 text-sm shadow-xs focus-within:ring-2 aria-invalid:border-destructive"
                            >
                                {variant === "typeaheadMulti" &&
                                    Array.isArray(field.value) &&
                                    field.value.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {field.value.map((selection: string, index: number) => (
                                                <Badge
                                                    key={index}
                                                    variant="secondary"
                                                    className="cursor-pointer gap-0.5 py-0 pr-1"
                                                    onClick={ev => {
                                                        ev.stopPropagation();
                                                        field.onChange(
                                                            field.value.filter(
                                                                (item: string) => item !== selection
                                                            )
                                                        );
                                                    }}
                                                >
                                                    {
                                                        users.find(u => u?.id === selection)
                                                            ?.username
                                                    }
                                                    <X className="size-3" aria-hidden />
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                <Input
                                    ref={textInputRef}
                                    value={inputValue}
                                    onChange={e => {
                                        setOpen(true);
                                        setInputValue(e.target.value);
                                        debounceFn(e.target.value);
                                    }}
                                    onFocus={() => setOpen(true)}
                                    placeholder={t("selectAUser")}
                                    autoComplete="off"
                                    className="min-w-24 flex-1 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
                                />
                                {!!search && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="size-6 shrink-0"
                                        onClick={() => {
                                            setInputValue("");
                                            setSearch("");
                                            field.onChange([]);
                                            textInputRef?.current?.focus();
                                        }}
                                        aria-label="Clear input value"
                                    >
                                        <X className="size-4" aria-hidden />
                                    </Button>
                                )}
                            </div>
                        </PopoverTrigger>
                        <PopoverContent
                            id="select-create-typeahead-listbox"
                            className="max-h-64 w-[var(--radix-popover-trigger-width)] overflow-auto p-0"
                            align="start"
                        >
                            <ul className="flex flex-col py-1" role="listbox">
                                {searchedUsers.map(user => {
                                    const option = user.id!;
                                    const isSelected = field.value?.includes(option);
                                    return (
                                        <li
                                            key={user.id}
                                            role="option"
                                            aria-selected={isSelected}
                                            className="hover:bg-accent focus:bg-accent cursor-pointer px-2 py-1.5 text-sm outline-none"
                                            onMouseDown={e => e.preventDefault()}
                                            onClick={() => {
                                                if (variant !== "typeaheadMulti") {
                                                    const removed = field.value?.includes(option);
                                                    field.onChange(removed ? [] : [option]);
                                                    setInputValue(
                                                        removed ? "" : (user.username || "")
                                                    );
                                                    setOpen(false);
                                                } else {
                                                    const current = Array.isArray(field.value)
                                                        ? field.value
                                                        : [];
                                                    const changedValue = current.includes(option)
                                                        ? current.filter((v: string) => v !== option)
                                                        : [...current, option];
                                                    field.onChange(changedValue);
                                                }
                                            }}
                                        >
                                            {user.username}
                                        </li>
                                    );
                                })}
                            </ul>
                        </PopoverContent>
                    </Popover>
                )}
            />
        </FormLabel>
    );
};
