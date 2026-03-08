import { useTranslation } from "@merge-rd/i18n";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@merge-rd/ui/components/tabs";
import { useNavigate } from "@tanstack/react-router";
import { useRealm } from "../../app/providers/realm-context/realm-context";
import { useParams } from "../../shared/lib/useParams";
import { AdminEvents } from "./admin-events";
import type { EventsTab } from "../../shared/lib/routes/events";
import { toEvents } from "../../shared/lib/routes/events";
import { UserEvents } from "./user-events";

export default function EventsSection() {
    const { t } = useTranslation();
    const { realm } = useRealm();
    const { tab } = useParams<{ tab?: string }>();
    const navigate = useNavigate();

    const currentTab: EventsTab = tab === "admin-events" ? "admin-events" : "user-events";

    return (
        <div className="pt-4 pb-6 px-0">
            <Tabs
                value={currentTab}
                onValueChange={value =>
                    navigate({
                        to: toEvents({
                            realm,
                            tab:
                                value === "user-events" ? undefined : (value as EventsTab)
                        }) as string
                    })
                }
            >
                <div className="w-full min-w-0 overflow-x-auto overflow-y-hidden mb-4">
                    <TabsList
                        variant="line"
                        className="mb-0 w-max min-w-0 **:data-[slot=tabs-trigger]:flex-none"
                    >
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
    );
}
