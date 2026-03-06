import {
    getErrorDescription,
    getErrorMessage,
} from "../../../shared/keycloak-ui-shared";
import { toast } from "sonner";
import CodeEditor from "../../components/form/code-editor";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { prettyPrintJSON } from "../../util";
import { FormPanel } from "../../../shared/keycloak-ui-shared";
import { FixedButtonsGroup } from "../../components/form/fixed-button-group";
import { useUserProfile } from "./user-profile-context";

export const JsonEditorTab = () => {
    const { config, save, isSaving } = useUserProfile();
    const { t } = useTranslation();
    const [code, setCode] = useState(prettyPrintJSON(config));

    function resetCode() {
        setCode(config ? prettyPrintJSON(config) : "");
    }

    async function handleSave() {
        const value = code;

        if (!value) {
            return;
        }

        try {
            await save(JSON.parse(value));
        } catch (error) {
            toast.error(
                t("invalidJsonError", { error: getErrorMessage(error) }),
                { description: getErrorDescription(error) },
            );
            return;
        }
    }

    return (
        <div className="mt-6 space-y-6">
            <FormPanel title={t("jsonEditor")} className="space-y-4">
                <CodeEditor
                    language="json"
                    value={code}
                    onChange={(value) => setCode(value ?? "")}
                    height={480}
                />
            </FormPanel>
            <FixedButtonsGroup
                name="jsonEditor"
                save={handleSave}
                reset={resetCode}
                isDisabled={isSaving}
            />
        </div>
    );
};
