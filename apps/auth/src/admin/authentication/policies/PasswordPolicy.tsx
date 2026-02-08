import type PasswordPolicyTypeRepresentation from "@keycloak/keycloak-admin-client/lib/defs/passwordPolicyTypeRepresentation";
import type RealmRepresentation from "@keycloak/keycloak-admin-client/lib/defs/realmRepresentation";
import { getErrorDescription, getErrorMessage } from "../../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { Button } from "@merge/ui/components/button";
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
import { FixedButtonsGroup } from "../../components/form/FixedButtonGroup";
import { FormPanel } from "../../../shared/keycloak-ui-shared";
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
            toast.success(t("updatePasswordPolicySuccess"));
        } catch (error: any) {
            toast.error(t("updatePasswordPolicyError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    if (!rows.length && !realm.passwordPolicy) {
        return (
            <FormPanel title={t("passwordPolicy")}>
                <div
                    data-testid="empty-state"
                    className="flex flex-col items-center justify-center gap-4 py-16"
                >
                    <PlusCircle className="size-10 text-muted-foreground" />
                    <h2 className="text-lg font-semibold">{t("noPasswordPolicies")}</h2>
                    <p className="text-center text-muted-foreground text-sm">
                        {t("noPasswordPoliciesInstructions")}
                    </p>
                    <PolicySelect onSelect={onSelect} selectedPolicies={[]} />
                </div>
            </FormPanel>
        );
    }

    return (
        <FormProvider {...form}>
            <FormAccess
                role="manage-realm"
                isHorizontal
                className="space-y-4"
                onSubmit={handleSubmit(save)}
            >
                <FormPanel title={t("passwordPolicy")}>
                    <div className="space-y-6">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <PolicySelect
                                onSelect={onSelect}
                                selectedPolicies={rows}
                            />
                        </div>
                        <div className="space-y-4">
                            {rows.map((r, index) => (
                                <PolicyRow
                                    key={`${r.id}-${index}`}
                                    policy={r}
                                    onRemove={id => {
                                        setRows(rows.filter(x => x.id !== id));
                                        setValue(r.id!, "", { shouldDirty: true });
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </FormPanel>
                <FixedButtonsGroup
                    name="passwordPolicy"
                    reset={() => setupForm(realm)}
                    resetText={t("reload")}
                    isSubmit
                    isDisabled={!isDirty}
                />
            </FormAccess>
        </FormProvider>
    );
};
