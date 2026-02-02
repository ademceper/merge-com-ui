/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/clients/ClientSessions.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import type ClientRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientRepresentation";
import type UserSessionRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userSessionRepresentation";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../admin-client";
import { fetchAdminUI } from "../context/auth/admin-ui-endpoint";
import SessionsTable from "../sessions/SessionsTable";

type ClientSessionsProps = {
    client: ClientRepresentation;
};

export const ClientSessions = ({ client }: ClientSessionsProps) => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();

    const loader = async (first?: number, max?: number, search?: string) =>
        fetchAdminUI<UserSessionRepresentation[]>(adminClient, "ui-ext/sessions/client", {
            first: `${first}`,
            max: `${max}`,
            type: "ALL",
            clientId: client.id!,
            search: search || ""
        });

    return (
        <div className="p-0">
            <SessionsTable
                loader={loader}
                hiddenColumns={["clients"]}
                emptyInstructions={t("noSessionsForClient")}
            />
        </div>
    );
};
