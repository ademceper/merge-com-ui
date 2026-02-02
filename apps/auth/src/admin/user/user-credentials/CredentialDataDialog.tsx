/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/user/user-credentials/CredentialDataDialog.tsx"
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

type CredentialDataDialogProps = {
    title: string;
    credentialData: [string, string][];
    onClose: () => void;
};

export const CredentialDataDialog = ({
    title,
    credentialData,
    onClose
}: CredentialDataDialogProps) => {
    const { t } = useTranslation();
    return (
        <Dialog open={true} onOpenChange={(v) => !v && onClose()}>
            <DialogContent showCloseButton className="sm:max-w-lg" data-testid="passwordDataDialog">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <Table aria-label={title} data-testid="password-data-dialog" className="text-sm">
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t("showPasswordDataName")}</TableHead>
                            <TableHead>{t("showPasswordDataValue")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {credentialData.map((cred, index) => (
                            <TableRow key={index}>
                                <TableCell>{cred[0]}</TableCell>
                                <TableCell>{cred[1]}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </DialogContent>
        </Dialog>
    );
};
