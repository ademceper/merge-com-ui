import type UserSessionRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userSessionRepresentation";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../admin-client";
import { useRealm } from "../context/realm-context/RealmContext";
import { useFetch } from "../../shared/keycloak-ui-shared";
import SessionsTable from "../sessions/SessionsTable";
import { useParams } from "../utils/useParams";
import type { UserParams } from "./routes/User";

export const UserSessions = () => {
    const { adminClient } = useAdminClient();
    const { id } = useParams<UserParams>();
    const { realm } = useRealm();
    const { t } = useTranslation();

    const [key, setKey] = useState(0);
    const refresh = () => setKey((k) => k + 1);
    const [sessions, setSessions] = useState<UserSessionRepresentation[]>([]);

    useFetch(
        () => adminClient.users.listSessions({ id: id!, realm }),
        (data) => setSessions(data),
        [key, id, realm]
    );

    return (
        <div className="py-6 px-0">
            <SessionsTable
                key={key}
                sessions={sessions}
                refresh={refresh}
                hiddenColumns={["username", "type"]}
                emptyMessage={t("noSessionsForUser")}
                logoutUser={id}
            />
        </div>
    );
};
