/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/events/EventsSection.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

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
                divider={false}
            />
            <div className="bg-muted/30 p-0">
                {content}
            </div>
        </>
    );
}
