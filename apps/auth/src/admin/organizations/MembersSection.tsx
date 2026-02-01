/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/organizations/MembersSection.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { Tab, Tabs, TabTitleText } from "../../shared/@patternfly/react-core";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Invitations } from "./Invitations";
import { Members } from "./Members";

export const MembersSection = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState("members");

    return (
        <Tabs activeKey={activeTab} onSelect={(_, key) => setActiveTab(key as string)}>
            <Tab
                eventKey="members"
                title={<TabTitleText>{t("members")}</TabTitleText>}
                data-testid="organization-members-tab"
            >
                <Members />
            </Tab>
            <Tab
                eventKey="invitations"
                title={<TabTitleText>{t("invitations")}</TabTitleText>}
                data-testid="organization-invitations-tab"
            >
                <Invitations />
            </Tab>
        </Tabs>
    );
};
