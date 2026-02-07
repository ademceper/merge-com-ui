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
                <div className="w-full min-w-0 overflow-x-auto overflow-y-hidden mb-4">
                    <TabsList variant="line" className="mb-0 w-max min-w-0 **:data-[slot=tabs-trigger]:flex-none">
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
                </div>
                <TabsContent value="attributes" className="mt-0 pt-0 outline-none">
                    <AttributesTab setTableData={setTableData} />
                </TabsContent>
                <TabsContent value="attributes-group" className="mt-0 pt-0 outline-none">
                    <AttributesGroupTab setTableData={setTableData} />
                </TabsContent>
                <TabsContent value="json-editor" className="mt-0 pt-0 outline-none">
                    <JsonEditorTab />
                </TabsContent>
            </Tabs>
        </UserProfileProvider>
    );
};
