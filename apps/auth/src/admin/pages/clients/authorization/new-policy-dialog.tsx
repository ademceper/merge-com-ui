import type PolicyProviderRepresentation from "@keycloak/keycloak-admin-client/lib/defs/policyProviderRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@merge-rd/ui/components/dialog";
import { cn } from "@merge-rd/ui/lib/utils";
import { useMemo } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/admin/shared/ui/data-table";
import useLocaleSort, { mapByKey } from "../../../shared/lib/useLocaleSort";
import { isValidComponentType } from "./policy/policy-details";

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
        <Dialog open={true} onOpenChange={v => !v && toggleDialog()}>
            <DialogContent
                showCloseButton
                className="sm:max-w-lg"
                aria-label={t("createPolicy")}
            >
                <DialogHeader>
                    <DialogTitle>{t("chooseAPolicyType")}</DialogTitle>
                    <p className="text-muted-foreground text-sm">
                        {t("chooseAPolicyTypeInstructions")}
                    </p>
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
