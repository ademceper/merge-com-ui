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
    const renderContent = () => {
        switch (subTab) {
            case "attributes-group":
                return <AttributesGroupTab setTableData={setTableData} />;
            case "json-editor":
                return <JsonEditorTab />;
            default:
                return <AttributesTab setTableData={setTableData} />;
        }
    };

    return (
        <UserProfileProvider>
            {renderContent()}
        </UserProfileProvider>
    );
};
