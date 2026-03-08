import { useTranslation } from "@merge-rd/i18n";
import { useRealm } from "../../app/providers/realm-context/realm-context";
import type { UserParams } from "../../shared/lib/routes/user";
import { useParams } from "../../shared/lib/use-params";
import { SessionsTable } from "../sessions/sessions-table";
import { useUserSessions } from "./hooks/use-user-sessions";

export const UserSessions = () => {
    const { id } = useParams<UserParams>();
    const { realm } = useRealm();
    const { t } = useTranslation();

    const { data: sessions = [], refetch } = useUserSessions(id!, realm);
    const refresh = () => refetch();

    return (
        <div className="pt-4 pb-6 px-0">
            <SessionsTable
                sessions={sessions}
                refresh={refresh}
                hiddenColumns={["username", "type"]}
                emptyMessage={t("noSessionsForUser")}
                logoutUser={id}
            />
        </div>
    );
};
