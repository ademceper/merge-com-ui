/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/clients/authorization/NewPolicyDialog.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { useTranslation } from "react-i18next";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@merge/ui/components/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@merge/ui/components/table";
import { cn } from "@merge/ui/lib/utils";

import type PolicyProviderRepresentation from "@keycloak/keycloak-admin-client/lib/defs/policyProviderRepresentation";
import { isValidComponentType } from "./policy/PolicyDetails";
import { useMemo } from "react";
import useLocaleSort, { mapByKey } from "../../utils/useLocaleSort";

type NewPolicyDialogProps = {
    policyProviders?: PolicyProviderRepresentation[];
    toggleDialog: () => void;
    onSelect: (provider: PolicyProviderRepresentation) => void;
};

export const NewPolicyDialog = ({
    policyProviders,
    onSelect,
    toggleDialog
}: NewPolicyDialogProps) => {
    const { t } = useTranslation();
    const localeSort = useLocaleSort();

    const sortedPolicies = useMemo(
        () => (policyProviders ? localeSort(policyProviders, mapByKey("name")) : []),
        [policyProviders]
    );

    return (
        <Dialog open={true} onOpenChange={(v) => !v && toggleDialog()}>
            <DialogContent showCloseButton className="sm:max-w-lg" aria-label={t("createPolicy")}>
                <DialogHeader>
                    <DialogTitle>{t("chooseAPolicyType")}</DialogTitle>
                    <p className="text-muted-foreground text-sm">{t("chooseAPolicyTypeInstructions")}</p>
                </DialogHeader>
                <Table aria-label={t("policies")} className="text-sm">
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t("name")}</TableHead>
                            <TableHead>{t("description")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedPolicies.map(provider => (
                            <TableRow
                                key={provider.type}
                                data-testid={provider.type}
                                onClick={() => onSelect(provider)}
                                className={cn("cursor-pointer")}
                            >
                                <TableCell>{provider.name}</TableCell>
                                <TableCell className="whitespace-normal">
                                    {isValidComponentType(provider.type!) &&
                                        t(`policyProvider.${provider.type}`)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </DialogContent>
        </Dialog>
    );
};
