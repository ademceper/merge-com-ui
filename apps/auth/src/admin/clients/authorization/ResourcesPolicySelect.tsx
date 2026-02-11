import PolicyProviderRepresentation from "@keycloak/keycloak-admin-client/lib/defs/policyProviderRepresentation";
import type PolicyRepresentation from "@keycloak/keycloak-admin-client/lib/defs/policyRepresentation";
import type ResourceRepresentation from "@keycloak/keycloak-admin-client/lib/defs/resourceRepresentation";
import type {
    Clients,
    PolicyQuery
} from "@keycloak/keycloak-admin-client/lib/resources/clients";
import { SelectVariant, useFetch } from "../../../shared/keycloak-ui-shared";
import { Button } from "@merge/ui/components/button";
import { Badge } from "@merge/ui/components/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@merge/ui/components/select";
import { Popover, PopoverContent, PopoverTrigger } from "@merge/ui/components/popover";
import { useState } from "react";
import {
    Controller,
    ControllerRenderProps,
    useFormContext,
    useWatch
} from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useAdminClient } from "../../admin-client";
import { useConfirmDialog } from "../../components/confirm-dialog/ConfirmDialog";
import { useRealm } from "../../context/realm-context/RealmContext";
import useToggle from "../../utils/useToggle";
import { toCreatePolicy } from "../routes/NewPolicy";
import { toPolicyDetails } from "../routes/PolicyDetails";
import { toResourceDetails } from "../routes/Resource";
import { NewPolicyDialog } from "./NewPolicyDialog";
import { useIsAdminPermissionsClient } from "../../utils/useIsAdminPermissionsClient";

type Type = "resources" | "policies";
type Variant = "single" | "typeahead" | "typeaheadMulti";

type ResourcesPolicySelectProps = {
    name: Type;
    clientId: string;
    permissionId?: string;
    variant?: Variant;
    preSelected?: string;
    isRequired?: boolean;
};

type Policies = {
    id?: string;
    name?: string;
    type?: string;
};

type TypeMapping = {
    [key in Type]: {
        searchFunction: keyof Pick<Clients, "listPolicies" | "listResources">;
        fetchFunction: keyof Pick<
            Clients,
            "getAssociatedPolicies" | "getAssociatedResources"
        >;
    };
};

const typeMapping: TypeMapping = {
    resources: {
        searchFunction: "listResources",
        fetchFunction: "getAssociatedResources"
    },
    policies: {
        searchFunction: "listPolicies",
        fetchFunction: "getAssociatedPolicies"
    }
};

export const ResourcesPolicySelect = ({
    name,
    clientId,
    permissionId,
    variant = SelectVariant.typeaheadMulti,
    preSelected,
    isRequired = false
}: ResourcesPolicySelectProps) => {
    const { adminClient } = useAdminClient();

    const { realm } = useRealm();
    const { t } = useTranslation();
    const navigate = useNavigate();

    const {
        control,
        formState: { errors, isDirty }
    } = useFormContext<PolicyRepresentation>();
    const [items, setItems] = useState<Policies[]>([]);
    const [search, setSearch] = useState("");
    const [open, setOpen] = useState(false);
    const [createPolicyDialog, toggleCreatePolicyDialog] = useToggle();
    const [policyProviders, setPolicyProviders] =
        useState<PolicyProviderRepresentation[]>();
    const [onUnsavedChangesConfirm, setOnUnsavedChangesConfirm] = useState<() => void>();
    const isAdminPermissionsClient = useIsAdminPermissionsClient(clientId);
    const [selected, setSelected] = useState<Policies[]>([]);

    const functions = typeMapping[name];

    const value = useWatch({
        control,
        name: name!,
        defaultValue: preSelected ? [preSelected] : []
    });

    const convert = (p: PolicyRepresentation | ResourceRepresentation): Policies => ({
        id: "_id" in p ? p._id : "id" in p ? p.id : undefined,
        name: p.name,
        type: p.type
    });

    useFetch(
        async () => {
            const params: PolicyQuery = Object.assign(
                { id: clientId, first: 0, max: 10, permission: "false" },
                search === "" ? null : { name: search }
            );
            return await Promise.all([
                adminClient.clients.listPolicyProviders({ id: clientId }),
                adminClient.clients[functions.searchFunction](params),
                permissionId
                    ? adminClient.clients[functions.fetchFunction]({
                          id: clientId,
                          permissionId
                      })
                    : Promise.resolve([]),
                preSelected && name === "resources"
                    ? adminClient.clients.getResource({
                          id: clientId,
                          resourceId: preSelected
                      })
                    : Promise.resolve([])
            ]);
        },
        ([providers, ...policies]) => {
            setPolicyProviders(
                providers.filter(p => p.type !== "resource" && p.type !== "scope")
            );
            setItems(
                policies
                    .flat()
                    .filter(
                        (r): r is PolicyRepresentation | ResourceRepresentation =>
                            typeof r !== "string"
                    )
                    .map(convert)
                    .filter(
                        ({ id }, index, self) =>
                            index === self.findIndex(({ id: otherId }) => id === otherId)
                    )
            );
        },
        [search]
    );

    useFetch(
        async () => {
            if (name === "resources")
                return await Promise.all(
                    (value || []).map(id =>
                        adminClient.clients.getResource({ id: clientId, resourceId: id })
                    )
                );
            return await Promise.all(
                (value || []).map(async id =>
                    adminClient.clients.findOnePolicy({
                        id: clientId,
                        policyId: id
                    })
                )
            );
        },
        (result: any[]) => setSelected(result.map(r => convert(r))),
        [value]
    );

    const [toggleUnsavedChangesDialog, UnsavedChangesConfirm] = useConfirmDialog({
        titleKey: t("unsavedChangesTitle"),
        messageKey: t("unsavedChangesConfirm"),
        continueButtonLabel: t("continue"),
        continueButtonVariant: "destructive",
        onConfirm: () => onUnsavedChangesConfirm?.()
    });

    const to = (policy: Policies) =>
        name === "policies"
            ? toPolicyDetails({
                  realm: realm,
                  id: clientId,
                  policyId: policy.id!,
                  policyType: policy.type!
              })
            : toResourceDetails({
                  realm,
                  id: clientId,
                  resourceId: policy.id!
              });

    const toChipGroupItems = (
        field: ControllerRenderProps<PolicyRepresentation, Type>
    ) => {
        return (
            <div className="flex flex-wrap gap-1">
                {selected?.map(item => (
                    <Badge
                        key={item.id}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => {
                            field.onChange(
                                field.value?.filter(id => id !== item.id) || []
                            );
                            setSelected(selected?.filter(p => p.id !== item.id) || []);
                        }}
                    >
                        {!isAdminPermissionsClient ? (
                            <Link
                                to={to(item)}
                                onClick={event => {
                                    if (isDirty) {
                                        event.preventDefault();
                                        setOnUnsavedChangesConfirm(
                                            () => () => navigate(to(item))
                                        );
                                        toggleUnsavedChangesDialog();
                                    }
                                }}
                            >
                                {item.name}
                            </Link>
                        ) : (
                            item.name
                        )}
                        &times;
                    </Badge>
                ))}
            </div>
        );
    };

    return (
        <>
            <UnsavedChangesConfirm />
            {createPolicyDialog && (
                <NewPolicyDialog
                    policyProviders={policyProviders}
                    onSelect={p => {
                        navigate(
                            toCreatePolicy({ id: clientId, realm, policyType: p.type! })
                        );
                    }}
                    toggleDialog={toggleCreatePolicyDialog}
                />
            )}
            <Controller
                name={name}
                defaultValue={preSelected ? [preSelected] : []}
                control={control}
                rules={{ validate: value => !isRequired || value!.length > 0 }}
                render={({ field }) =>
                    variant === SelectVariant.typeaheadMulti ? (
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <div
                                    id={name}
                                    role="combobox"
                                    aria-expanded={open}
                                    aria-invalid={!!errors[name]}
                                    className="border-input focus-within:ring-ring flex min-h-9 w-full flex-wrap items-center gap-1 rounded-md border bg-transparent px-2 py-1.5 text-sm shadow-xs focus-within:ring-2"
                                >
                                    {toChipGroupItems(field)}
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 shrink-0"
                                        onClick={() => setOpen(true)}
                                    >
                                        {selected?.length ? t("addMore") : t(name)}
                                    </Button>
                                </div>
                            </PopoverTrigger>
                            <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
                                <div className="border-b p-2">
                                    <input
                                        type="text"
                                        placeholder={t("filter")}
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="border-input bg-background flex h-8 w-full rounded-md border px-2 text-sm"
                                    />
                                </div>
                                <ul className="max-h-64 overflow-auto py-1">
                                    {items.map((p) => {
                                        const id = p.id ?? "";
                                        const isSelected = (field.value ?? []).includes(id);
                                        return (
                                            <li
                                                key={p.id}
                                                role="option"
                                                aria-selected={isSelected}
                                                className="hover:bg-accent cursor-pointer px-2 py-1.5 text-sm"
                                                onMouseDown={(e) => e.preventDefault()}
                                                onClick={() => {
                                                    const changedValue = isSelected
                                                        ? (field.value ?? []).filter((x: string) => x !== id)
                                                        : [...(field.value ?? []), id];
                                                    field.onChange(changedValue);
                                                    setSearch("");
                                                }}
                                            >
                                                {p.name}
                                            </li>
                                        );
                                    })}
                                </ul>
                                {selected?.length > 0 && (
                                    <div className="border-t px-2 py-1">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 w-full justify-center"
                                            onClick={() => {
                                                field.onChange([]);
                                                setSearch("");
                                                setOpen(false);
                                            }}
                                        >
                                            {t("clear")}
                                        </Button>
                                    </div>
                                )}
                                {name === "policies" && !isAdminPermissionsClient && (
                                    <div className="border-t px-2 py-1">
                                        <Button
                                            variant="link"
                                            className="h-7 w-full justify-center"
                                            onClick={() => {
                                                if (isDirty) {
                                                    setOpen(false);
                                                    setOnUnsavedChangesConfirm(() => toggleCreatePolicyDialog);
                                                    toggleUnsavedChangesDialog();
                                                } else {
                                                    toggleCreatePolicyDialog();
                                                }
                                            }}
                                        >
                                            {t("createPolicy")}
                                        </Button>
                                    </div>
                                )}
                            </PopoverContent>
                        </Popover>
                    ) : (
                        <Select
                            open={open}
                            onOpenChange={setOpen}
                            value={field.value?.[0] ?? ""}
                            onValueChange={(v) => {
                                field.onChange([v]);
                                setSearch("");
                            }}
                            aria-invalid={!!errors[name]}
                        >
                            <SelectTrigger id={name}>
                                <SelectValue placeholder={t(name)} />
                            </SelectTrigger>
                            <SelectContent>
                                {items.map((p) => (
                                    <SelectItem key={p.id} value={p.id ?? ""}>
                                        {p.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )
                }
            />
        </>
    );
};
