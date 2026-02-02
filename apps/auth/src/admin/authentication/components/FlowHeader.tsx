/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/authentication/components/FlowHeader.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import {
    TableHead,
    TableHeader,
    TableRow,
} from "@merge/ui/components/table";
import { DotsSixVertical } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";

export const FlowHeader = () => {
    const { t } = useTranslation();
    return (
        <TableHeader>
            <TableRow aria-labelledby="headerName" id="header">
                <TableHead className="w-10">
                    <span
                        className="keycloak__authentication__header-drag-button inline-flex items-center text-muted-foreground"
                        aria-label={t("disabled")}
                    >
                        <DotsSixVertical className="size-4" />
                    </span>
                    <span className="sr-only">{t("expandRow")}</span>
                </TableHead>
                <TableHead>{t("steps")}</TableHead>
                <TableHead>{t("requirement")}</TableHead>
                <TableHead className="sr-only">{t("config")}</TableHead>
                <TableHead className="sr-only">{t("config")}</TableHead>
                <TableHead className="sr-only">{t("config")}</TableHead>
                <TableHead className="sr-only">{t("config")}</TableHead>
            </TableRow>
        </TableHeader>
    );
};
