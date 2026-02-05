import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@merge/ui/components/tabs";
import { useRealm } from "../../context/realm-context/RealmContext";
import { toUserProfile } from "../routes/UserProfile";
import type { UserProfileTab as UserProfileTabType } from "../routes/UserProfile";
import { AttributesGroupTab } from "./AttributesGroupTab";
import { AttributesTab } from "./AttributesTab";
import { JsonEditorTab } from "./JsonEditorTab";
import { UserProfileProvider } from "./UserProfileContext";

type UserProfileTabProps = {
    setTableData: React.Dispatch<
        React.SetStateAction<Record<string, string>[] | undefined>
    >;
    subTab?: string;
};

export const UserProfileTab = ({ setTableData, subTab = "attributes" }: UserProfileTabProps) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { realm } = useRealm();
    const currentTab: UserProfileTabType =
        subTab === "attributes-group"
            ? "attributes-group"
            : subTab === "json-editor"
              ? "json-editor"
              : "attributes";

    return (
        <UserProfileProvider>
            <Tabs
                value={currentTab}
                onValueChange={(value) =>
                    navigate(toUserProfile({ realm: realm!, tab: value as UserProfileTabType }))
                }
            >
                <TabsList variant="line" className="mb-4">
                    <TabsTrigger value="attributes" data-testid="rs-user-profile-attributes-tab">
                        {t("attributes")}
                    </TabsTrigger>
                    <TabsTrigger value="attributes-group" data-testid="rs-user-profile-attributes-group-tab">
                        {t("attributesGroup")}
                    </TabsTrigger>
                    <TabsTrigger value="json-editor" data-testid="rs-user-profile-json-editor-tab">
                        {t("jsonEditor")}
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="attributes">
                    <AttributesTab setTableData={setTableData} />
                </TabsContent>
                <TabsContent value="attributes-group">
                    <AttributesGroupTab setTableData={setTableData} />
                </TabsContent>
                <TabsContent value="json-editor">
                    <JsonEditorTab />
                </TabsContent>
            </Tabs>
        </UserProfileProvider>
    );
};
