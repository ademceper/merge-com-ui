import { useState } from "react";
import { useTranslation } from "react-i18next";
// Tabs migrated to custom implementation

import type RealmRepresentation from "@keycloak/keycloak-admin-client/lib/defs/realmRepresentation";
import { HeadersForm } from "./HeadersForm";
import { BruteForceDetection } from "./BruteForceDetection";

type SecurityDefensesProps = {
    realm: RealmRepresentation;
    save: (realm: RealmRepresentation) => void;
};

export const SecurityDefenses = ({ realm, save }: SecurityDefensesProps) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState(10);
    return (
        <div>
            <div className="flex border-b" role="tablist">
                <button
                    role="tab"
                    className={`px-4 py-2 text-sm font-medium ${activeTab === 10 ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}
                    aria-selected={activeTab === 10}
                    onClick={() => setActiveTab(10)}
                    data-testid="security-defenses-headers-tab"
                >
                    {t("headers")}
                </button>
                <button
                    role="tab"
                    className={`px-4 py-2 text-sm font-medium ${activeTab === 20 ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}
                    aria-selected={activeTab === 20}
                    onClick={() => setActiveTab(20)}
                    data-testid="security-defenses-brute-force-tab"
                >
                    {t("bruteForceDetection")}
                </button>
            </div>
            {activeTab === 10 && (
                <div className="p-6">
                    <HeadersForm realm={realm} save={save} />
                </div>
            )}
            {activeTab === 20 && (
                <div className="p-6">
                    <BruteForceDetection realm={realm} save={save} />
                </div>
            )}
        </div>
    );
};
