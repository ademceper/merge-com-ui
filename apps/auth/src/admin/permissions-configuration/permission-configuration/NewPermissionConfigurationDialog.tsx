/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/permissions-configuration/permission-configuration/NewPermissionConfigurationDialog.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { ResourceTypesRepresentation } from "@keycloak/keycloak-admin-client/lib/defs/resourceServerRepresentation";
import { useTranslation } from "react-i18next";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@merge/ui/components/dialog";
import { Alert, AlertTitle } from "@merge/ui/components/alert";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@merge/ui/components/table";
import { cn } from "@merge/ui/lib/utils";

type NewPermissionConfigurationDialogProps = {
    resourceTypes?: ResourceTypesRepresentation[];
    toggleDialog: () => void;
    onSelect: (resourceType: ResourceTypesRepresentation) => void;
};

export const NewPermissionConfigurationDialog = ({
    resourceTypes,
    onSelect,
    toggleDialog
}: NewPermissionConfigurationDialogProps) => {
    const { t } = useTranslation();

    return (
        <Dialog open={true} onOpenChange={(v) => !v && toggleDialog()}>
            <DialogContent showCloseButton className="sm:max-w-lg" aria-label={t("createPermission")}>
                <DialogHeader>
                    <DialogTitle>{t("chooseAResourceType")}</DialogTitle>
                    <Alert className="mt-2">
                        <AlertTitle>{t("chooseAResourceTypeInstructions")}</AlertTitle>
                    </Alert>
                </DialogHeader>
                <Table aria-label={t("permissions")} className="text-sm">
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t("resourceType")}</TableHead>
                            <TableHead>{t("description")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Object.keys(resourceTypes || {}).map((key: any) => {
                            const resourceType = resourceTypes![key];
                            return (
                                <TableRow
                                    key={resourceType.type}
                                    data-testid={resourceType.type}
                                    onClick={() => onSelect(resourceType)}
                                    className={cn("cursor-pointer")}
                                >
                                    <TableCell>{resourceType.type}</TableCell>
                                    <TableCell className="whitespace-normal">
                                        {t(`resourceType.${resourceType.type}`)}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </DialogContent>
        </Dialog>
    );
};
