import type ClientRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientRepresentation";
import type UserSessionRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userSessionRepresentation";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../admin-client";
import { useFetch } from "../../shared/keycloak-ui-shared";
import { fetchAdminUI } from "../context/auth/admin-ui-endpoint";
import SessionsTable from "../sessions/SessionsTable";

type ClientSessionsProps = {
    client: ClientRepresentation;
};

export const ClientSessions = ({ client }: ClientSessionsProps) => {
    const { adminClient } = useAdminClient();
    const { t } = useTranslation();
    const [key, setKey] = useState(0);
    const refresh = () => setKey((k) => k + 1);
    const [sessions, setSessions] = useState<UserSessionRepresentation[]>([]);

    useFetch(
        () =>
            fetchAdminUI<UserSessionRepresentation[]>(adminClient, "ui-ext/sessions/client", {
                first: "0",
                max: "1000",
                type: "ALL",
                clientId: client.id!,
                search: ""
            }),
        (data) => setSessions(data),
        [key, client.id]
    );

    return (
        <div className="p-0">
            <SessionsTable
                key={key}
                sessions={sessions}
                refresh={refresh}
                hiddenColumns={["clients"]}
                emptyMessage={t("noSessionsForClient")}
            />
        </div>
    );
};
