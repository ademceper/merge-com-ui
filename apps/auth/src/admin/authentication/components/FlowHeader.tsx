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

import { DataListDragButton } from "../../../shared/@patternfly/react-core";
import { Th, Tr } from "../../../shared/@patternfly/react-table";
import { useTranslation } from "react-i18next";

import "./flow-header.css";

export const FlowHeader = () => {
    const { t } = useTranslation();
    return (
        <Tr aria-labelledby="headerName" id="header">
            <Th>
                <DataListDragButton
                    className="keycloak__authentication__header-drag-button"
                    aria-label={t("disabled")}
                />
                <Th screenReaderText={t("expandRow")} />
            </Th>
            <Th>{t("steps")}</Th>
            <Th>{t("requirement")}</Th>
            <Th screenReaderText={t("config")}></Th>
            <Th screenReaderText={t("config")}></Th>
            <Th screenReaderText={t("config")}></Th>
            <Th screenReaderText={t("config")}></Th>
        </Tr>
    );
};
