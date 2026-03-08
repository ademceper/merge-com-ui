import { useTranslation } from "@merge-rd/i18n";
import { useRealm } from "../../app/providers/realm-context/realm-context";
import { useParams } from "../../shared/lib/useParams";
import SessionsTable from "../sessions/sessions-table";
import { useUserSessions } from "./api/use-user-sessions";
import type { UserParams } from "../../shared/lib/routes/user";

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
