/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/realm-settings/PartialExport.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { AlertVariant } from "../../shared/keycloak-ui-shared";
import { Alert, AlertDescription, AlertTitle } from "@merge/ui/components/alert";
import { Button } from "@merge/ui/components/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@merge/ui/components/dialog";
import { Label } from "@merge/ui/components/label";
import { Switch } from "@merge/ui/components/switch";
import { saveAs } from "file-saver";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../admin-client";
import { useAlerts } from "../../shared/keycloak-ui-shared";
import { useRealm } from "../context/realm-context/RealmContext";
import { prettyPrintJSON } from "../util";


export type PartialExportDialogProps = {
    isOpen: boolean;
    onClose: () => void;
};

export const PartialExportDialog = ({ isOpen, onClose }: PartialExportDialogProps) => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const { realm } = useRealm();
    const { addAlert, addError } = useAlerts();

    const [exportGroupsAndRoles, setExportGroupsAndRoles] = useState(false);
    const [exportClients, setExportClients] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const showWarning = exportGroupsAndRoles || exportClients;

    async function exportRealm() {
        setIsExporting(true);

        try {
            const realmExport = await adminClient.realms.export({
                realm,
                exportClients,
                exportGroupsAndRoles
            });

            saveAs(
                new Blob([prettyPrintJSON(realmExport)], {
                    type: "application/json"
                }),
                "realm-export.json"
            );

            addAlert(t("exportSuccess"), AlertVariant.success);
            onClose();
        } catch (error) {
            addError("exportFail", error);
        }

        setIsExporting(false);
    }

    return (
        <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{t("partialExport")}</DialogTitle>
                </DialogHeader>
                <p>{t("partialExportHeaderText")}</p>
                <form className="keycloak__realm-settings__partial-import_form space-y-4">
                    <div className="flex items-center justify-between gap-4">
                        <Label htmlFor="include-groups-and-roles-check">
                            {t("includeGroupsAndRoles")}
                        </Label>
                        <Switch
                            id="include-groups-and-roles-check"
                            data-testid="include-groups-and-roles-check"
                            checked={exportGroupsAndRoles}
                            onCheckedChange={setExportGroupsAndRoles}
                            aria-label={t("includeGroupsAndRoles")}
                        />
                    </div>
                    <div className="flex items-center justify-between gap-4">
                        <Label htmlFor="include-clients-check">
                            {t("includeClients")}
                        </Label>
                        <Switch
                            id="include-clients-check"
                            data-testid="include-clients-check"
                            checked={exportClients}
                            onCheckedChange={setExportClients}
                            aria-label={t("includeClients")}
                        />
                    </div>
                </form>

                {showWarning && (
                    <Alert data-testid="warning-message" variant="destructive">
                        <AlertTitle>{t("exportWarningTitle")}</AlertTitle>
                        <AlertDescription>
                            {t("exportWarningDescription")}
                        </AlertDescription>
                    </Alert>
                )}
                <DialogFooter>
                    <Button variant="link" data-testid="cancel" onClick={onClose}>
                        {t("cancel")}
                    </Button>
                    <Button
                        data-testid="confirm"
                        disabled={isExporting}
                        onClick={exportRealm}
                    >
                        {t("export")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
