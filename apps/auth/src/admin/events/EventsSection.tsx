import { Trans, useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { ViewHeader } from "../components/view-header/ViewHeader";
import { useRealm } from "../context/realm-context/RealmContext";
import helpUrls from "../help-urls";
import { toRealmSettings } from "../realm-settings/routes/RealmSettings";
import { AdminEvents } from "./AdminEvents";
import { UserEvents } from "./UserEvents";

export default function EventsSection() {
    const { t } = useTranslation();
    const { realm } = useRealm();
    const { tab } = useParams<{ tab?: string }>();

    const content = tab === "admin-events" ? <AdminEvents /> : <UserEvents />;

    return (
        <>
            <ViewHeader
                titleKey="titleEvents"
                subKey={
                    <Trans i18nKey="eventExplain">
                        If you want to configure user events, Admin events or Event
                        listeners, please enter
                        <Link to={toRealmSettings({ realm, tab: "events" })}>
                            {t("eventConfig")}
                        </Link>
                        page realm settings to configure.
                    </Trans>
                }
                helpUrl={helpUrls.eventsUrl}
                divider
            />
            <div className="py-6 px-0">
                {content}
            </div>
        </>
    );
}
