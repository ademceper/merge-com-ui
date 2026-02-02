/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/authentication/policies/PasswordPolicy.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import type PasswordPolicyTypeRepresentation from "@keycloak/keycloak-admin-client/lib/defs/passwordPolicyTypeRepresentation";
import type RealmRepresentation from "@keycloak/keycloak-admin-client/lib/defs/realmRepresentation";
import { AlertVariant, useAlerts } from "../../../shared/keycloak-ui-shared";
import { Button } from "@merge/ui/components/button";
import { Separator } from "@merge/ui/components/separator";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@merge/ui/components/dropdown-menu";
import { PlusCircle } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../../admin-client";
import { FormAccess } from "../../components/form/FormAccess";
import { useRealm } from "../../context/realm-context/RealmContext";
import { useServerInfo } from "../../context/server-info/ServerInfoProvider";
import { PolicyRow } from "./PolicyRow";
import { SubmittedValues, parsePolicy, serializePolicy } from "./util";

type PolicySelectProps = {
    onSelect: (row: PasswordPolicyTypeRepresentation) => void;
    selectedPolicies: PasswordPolicyTypeRepresentation[];
};

const PolicySelect = ({ onSelect, selectedPolicies }: PolicySelectProps) => {
    const { t } = useTranslation();
    const { passwordPolicies } = useServerInfo();
    const [open, setOpen] = useState(false);

    const policies = useMemo(
        () =>
            passwordPolicies?.filter(
                p => selectedPolicies.find(o => o.id === p.id) === undefined
            ),
        [selectedPolicies]
    );

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    disabled={policies?.length === 0}
                    style={{ width: "300px" }}
                    data-testid="add-policy"
                >
                    {t("addPolicy")}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                {policies?.map(policy => (
                    <DropdownMenuItem
                        key={policy.id}
                        onClick={() => {
                            onSelect(policy);
                            setOpen(false);
                        }}
                    >
                        {policy.displayName}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

type PasswordPolicyProps = {
    realm: RealmRepresentation;
    realmUpdated: (realm: RealmRepresentation) => void;
};

export const PasswordPolicy = ({ realm, realmUpdated }: PasswordPolicyProps) => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const { passwordPolicies } = useServerInfo();

    const { addAlert, addError } = useAlerts();
    const { realm: realmName, refresh } = useRealm();

    const [rows, setRows] = useState<PasswordPolicyTypeRepresentation[]>([]);
    const onSelect = (row: PasswordPolicyTypeRepresentation) => {
        setRows([...rows, row]);
        setValue(row.id!, row.defaultValue!, { shouldDirty: true });
    };

    const form = useForm<SubmittedValues>({
        defaultValues: {}
    });
    const {
        handleSubmit,
        setValue,
        reset,
        formState: { isDirty }
    } = form;

    const setupForm = (realm: RealmRepresentation) => {
        reset();
        const values = parsePolicy(realm.passwordPolicy || "", passwordPolicies!);
        values.forEach(v => {
            setValue(v.id!, v.value!);
        });
        setRows(values);
    };

    useEffect(() => setupForm(realm), []);

    const save = async (values: SubmittedValues) => {
        const updatedRealm = {
            ...realm,
            passwordPolicy: serializePolicy(rows, values)
        };
        try {
            await adminClient.realms.update({ realm: realmName }, updatedRealm);
            realmUpdated(updatedRealm);
            setupForm(updatedRealm);
            refresh();
            addAlert(t("updatePasswordPolicySuccess"), AlertVariant.success);
        } catch (error: any) {
            addError("updatePasswordPolicyError", error);
        }
    };

    return (
        <div className="p-0">
            {(rows.length !== 0 || realm.passwordPolicy) && (
                <>
                    <div className="flex items-center gap-2 p-4">
                        <PolicySelect
                            onSelect={onSelect}
                            selectedPolicies={rows}
                        />
                    </div>
                    <Separator />
                    <div className="p-6">
                        <FormProvider {...form}>
                            <FormAccess
                                className="keycloak__policies_authentication__form"
                                role="manage-realm"
                                isHorizontal
                                onSubmit={handleSubmit(save)}
                            >
                                {rows.map((r, index) => (
                                    <PolicyRow
                                        key={`${r.id}-${index}`}
                                        policy={r}
                                        onRemove={id => {
                                            setRows(rows.filter(r => r.id !== id));
                                            setValue(r.id!, "", { shouldDirty: true });
                                        }}
                                    />
                                ))}
                                <div className="flex gap-2">
                                    <Button
                                        data-testid="save"
                                        variant="primary"
                                        type="submit"
                                        isDisabled={!isDirty}
                                    >
                                        {t("save")}
                                    </Button>
                                    <Button
                                        data-testid="reload"
                                        variant="link"
                                        onClick={() => setupForm(realm)}
                                    >
                                        {t("reload")}
                                    </Button>
                                </div>
                            </FormAccess>
                        </FormProvider>
                    </div>
                </>
            )}
            {!rows.length && !realm.passwordPolicy && (
                <div data-testid="empty-state" className="flex flex-col items-center justify-center py-16 gap-4">
                    <PlusCircle className="size-10 text-muted-foreground" />
                    <h1 className="text-xl font-semibold">{t("noPasswordPolicies")}</h1>
                    <p className="text-muted-foreground">{t("noPasswordPoliciesInstructions")}</p>
                    <PolicySelect onSelect={onSelect} selectedPolicies={[]} />
                </div>
            )}
        </div>
    );
};
