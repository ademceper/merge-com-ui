/**
 * This file has been claimed for ownership from @keycloakify/keycloak-account-ui version 260502.0.2.
 * To relinquish ownership and restore this file to its original content, run the following command:
 *
 * $ npx keycloakify own --path "account/resources/Resources.tsx" --revert
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@merge/ui/lib/utils";

import { ResourcesTab } from "./ResourcesTab";
import { Page } from "../components/page/Page";

export const Resources = () => {
    const { t } = useTranslation();
    const [activeTabKey, setActiveTabKey] = useState(0);

    return (
        <Page title={t("resources")} description={t("resourceIntroMessage")}>
            <div>
                <div className="flex border-b mb-4">
                    <button
                        type="button"
                        data-testid="myResources"
                        onClick={() => setActiveTabKey(0)}
                        className={cn(
                            "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
                            activeTabKey === 0
                                ? "border-primary text-primary"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                        )}
                    >
                        {t("myResources")}
                    </button>
                    <button
                        type="button"
                        data-testid="sharedWithMe"
                        onClick={() => setActiveTabKey(1)}
                        className={cn(
                            "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
                            activeTabKey === 1
                                ? "border-primary text-primary"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                        )}
                    >
                        {t("sharedWithMe")}
                    </button>
                </div>
                {activeTabKey === 0 && <ResourcesTab />}
                {activeTabKey === 1 && <ResourcesTab isShared />}
            </div>
        </Page>
    );
};

export default Resources;
