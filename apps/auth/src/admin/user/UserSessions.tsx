/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/user/UserSessions.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { useTranslation } from "react-i18next";
import { useAdminClient } from "../admin-client";
import { useRealm } from "../context/realm-context/RealmContext";
import SessionsTable from "../sessions/SessionsTable";
import { useParams } from "../utils/useParams";
import type { UserParams } from "./routes/User";

export const UserSessions = () => {
    const { adminClient } = useAdminClient();

    const { id } = useParams<UserParams>();
    const { realm } = useRealm();
    const { t } = useTranslation();

    const loader = () => adminClient.users.listSessions({ id, realm });

    return (
        <div className="bg-muted/30 p-0">
            <SessionsTable
                loader={loader}
                hiddenColumns={["username", "type"]}
                emptyInstructions={t("noSessionsForUser")}
                logoutUser={id}
            />
        </div>
    );
};
