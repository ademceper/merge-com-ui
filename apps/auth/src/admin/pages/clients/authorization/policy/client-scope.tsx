import type ClientScopeRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientScopeRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Button } from "@merge-rd/ui/components/button";
import { Checkbox } from "@merge-rd/ui/components/checkbox";
import { Label } from "@merge-rd/ui/components/label";
import { MinusCircle } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@merge-rd/ui/components/table";
import { HelpItem } from "@/shared/keycloak-ui-shared";
import { useLocaleSort, mapByKey } from "@/admin/shared/lib/use-locale-sort";
import { AddScopeDialog } from "@/admin/pages/clients/scopes/add-scope-dialog";
import { useClientScopes } from "../hooks/use-client-scopes";

export type RequiredIdValue = {
    id: string;
    required: boolean;
};

export const ClientScope = () => {
    const { t } = useTranslation();
    const { control, getValues, setValue } = useFormContext<{
        clientScopes: RequiredIdValue[];
    }>();

    const [open, setOpen] = useState(false);
    const [scopes, setScopes] = useState<ClientScopeRepresentation[]>([]);
    const [selectedScopes, setSelectedScopes] = useState<ClientScopeRepresentation[]>([]);

    const localeSort = useLocaleSort();

    const { data: clientScopesData } = useClientScopes();

    useEffect(() => {
        if (clientScopesData) {
            const allScopes = clientScopesData ?? [];
            const clientScopes = getValues("clientScopes") || [];
            setSelectedScopes(clientScopes.map(s => allScopes.find(c => c.id === s.id)!));
            setScopes(localeSort(allScopes, mapByKey("name")));
        }
    }, [clientScopesData]);

    return (
        <div className="space-y-2">
            <Label htmlFor="clientScopes" className="flex items-center gap-1">
                {t("clientScopes")}
                <HelpItem
                    helpText={t("clientsClientScopesHelp")}
                    fieldLabelId="clientScopes"
                />
            </Label>
            <div id="clientScopes">
                <Controller
                    name="clientScopes"
                    control={control}
                    defaultValue={[]}
                    render={({ field }) => (
                        <>
                            {open && (
                                <AddScopeDialog
                                    clientScopes={scopes.filter(
                                        scope =>
                                            !field.value
                                                .map((c: RequiredIdValue) => c.id)
                                                .includes(scope.id!)
                                    )}
                                    isClientScopesConditionType
                                    open={open}
                                    toggleDialog={() => setOpen(!open)}
                                    onAdd={scopes => {
                                        setSelectedScopes([
                                            ...selectedScopes,
                                            ...scopes.map(s => s.scope)
                                        ]);
                                        field.onChange([
                                            ...field.value,
                                            ...scopes
                                                .map(scope => scope.scope)
                                                .map(item => ({
                                                    id: item.id!,
                                                    required: false
                                                }))
                                        ]);
                                    }}
                                />
                            )}
                            <Button
                                type="button"
                                data-testid="select-scope-button"
                                variant="secondary"
                                onClick={() => setOpen(true)}
                            >
                                {t("addClientScopes")}
                            </Button>
                        </>
                    )}
                />
                {selectedScopes.length > 0 && (
                    <Table className="text-sm">
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t("clientScopeTitle")}</TableHead>
                                <TableHead>{t("required")}</TableHead>
                                <TableHead aria-hidden="true" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {selectedScopes.map((scope, index) => (
                                <TableRow key={scope.id}>
                                    <TableCell>{scope.name}</TableCell>
                                    <TableCell>
                                        <Controller
                                            name={`clientScopes.${index}.required`}
                                            defaultValue={false}
                                            control={control}
                                            render={({ field }) => (
                                                <Checkbox
                                                    id="required"
                                                    data-testid="standard"
                                                    name="required"
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            )}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="keycloak__client-authorization__policy-row-remove"
                                            onClick={() => {
                                                setValue("clientScopes", [
                                                    ...getValues("clientScopes").filter(
                                                        s => s.id !== scope.id
                                                    )
                                                ]);
                                                setSelectedScopes([
                                                    ...selectedScopes.filter(
                                                        s => s.id !== scope.id
                                                    )
                                                ]);
                                            }}
                                        >
                                            <MinusCircle className="size-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    );
};
