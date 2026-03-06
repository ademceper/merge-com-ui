import { Tabs, TabsContent, TabsList, TabsTrigger } from "@merge-rd/ui/components/tabs";
import { Trans, useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ViewHeader } from "../components/view-header/ViewHeader";
import { useRealm } from "../context/realm-context/RealmContext";
import helpUrls from "../help-urls";
import { toRealmSettings } from "../realm-settings/routes/RealmSettings";
import { AdminEvents } from "./AdminEvents";
import { toEvents } from "./routes/Events";
import type { EventsTab } from "./routes/Events";
import { UserEvents } from "./UserEvents";

export default function EventsSection() {
    const { t } = useTranslation();
    const { realm } = useRealm();
    const { tab } = useParams<{ tab?: string }>();
    const navigate = useNavigate();

    const currentTab: EventsTab = tab === "admin-events" ? "admin-events" : "user-events";

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
            <div className="pt-4 pb-6 px-0">
                <Tabs
                    value={currentTab}
                    onValueChange={(value) =>
                        navigate(toEvents({ realm, tab: value === "user-events" ? undefined : value as EventsTab }))
                    }
                >
                    <div className="w-full min-w-0 overflow-x-auto overflow-y-hidden mb-4">
                        <TabsList variant="line" className="mb-0 w-max min-w-0 **:data-[slot=tabs-trigger]:flex-none">
                            <TabsTrigger value="user-events" data-testid="events-user-tab">
                                {t("userEvents")}
                            </TabsTrigger>
                            <TabsTrigger value="admin-events" data-testid="events-admin-tab">
                                {t("adminEvents")}
                            </TabsTrigger>
                        </TabsList>
                    </div>
                    <TabsContent value="user-events" className="mt-0 pt-0 outline-none">
                        <UserEvents />
                    </TabsContent>
                    <TabsContent value="admin-events" className="mt-0 pt-0 outline-none">
                        <AdminEvents />
                    </TabsContent>
                </Tabs>
            </div>
        </>
    );
}
