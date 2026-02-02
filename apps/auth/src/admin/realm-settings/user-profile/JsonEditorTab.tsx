/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/realm-settings/user-profile/JsonEditorTab.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { useAlerts } from "../../../shared/keycloak-ui-shared";
import { Button } from "@merge/ui/components/button";
import CodeEditor from "../../components/form/CodeEditor";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { prettyPrintJSON } from "../../util";
import { useUserProfile } from "./UserProfileContext";

export const JsonEditorTab = () => {
    const { config, save, isSaving } = useUserProfile();
    const { t } = useTranslation();
    const { addError } = useAlerts();
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
            addError("invalidJsonError", error);
            return;
        }
    }

    return (
        <section className="py-6 bg-muted/30">
            <CodeEditor
                language="json"
                value={code}
                onChange={value => setCode(value ?? "")}
                height={480}
            />
            <div className="flex gap-2 mt-4">
                <Button
                    data-testid="save"
                    onClick={handleSave}
                    disabled={isSaving}
                >
                    {t("save")}
                </Button>
                <Button variant="ghost" onClick={resetCode} disabled={isSaving}>
                    {t("revert")}
                </Button>
            </div>
        </section>
    );
};
