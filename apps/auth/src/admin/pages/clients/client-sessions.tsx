import type ClientRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { SessionsTable } from "../sessions/sessions-table";
import { useClientSessions } from "./hooks/use-client-sessions";

type ClientSessionsProps = {
    client: ClientRepresentation;
};

export const ClientSessions = ({ client }: ClientSessionsProps) => {
    const { t } = useTranslation();
    const { data: sessions = [], refetch } = useClientSessions(client.id!);

    return (
        <div className="p-0">
            <SessionsTable
                sessions={sessions}
                refresh={refetch}
                hiddenColumns={["clients"]}
                emptyMessage={t("noSessionsForClient")}
            />
        </div>
    );
};
