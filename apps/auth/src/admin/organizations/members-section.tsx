import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Invitations } from "./Invitations";
import { Members } from "./Members";

export const MembersSection = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState("members");

    return (
        <div>
            <div className="flex border-b">
                <button
                    className={`px-4 py-2 text-sm font-medium ${activeTab === "members" ? "border-b-2 border-primary" : ""}`}
                    onClick={() => setActiveTab("members")}
                    data-testid="organization-members-tab"
                >
                    {t("members")}
                </button>
                <button
                    className={`px-4 py-2 text-sm font-medium ${activeTab === "invitations" ? "border-b-2 border-primary" : ""}`}
                    onClick={() => setActiveTab("invitations")}
                    data-testid="organization-invitations-tab"
                >
                    {t("invitations")}
                </button>
            </div>
            {activeTab === "members" && <Members />}
            {activeTab === "invitations" && <Invitations />}
        </div>
    );
};
