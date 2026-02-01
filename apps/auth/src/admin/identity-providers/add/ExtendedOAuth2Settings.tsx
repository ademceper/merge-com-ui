/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/identity-providers/add/ExtendedOAuth2Settings.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { NumberControl, SelectControl } from "../../../shared/keycloak-ui-shared";
import { ExpandableSection, Form } from "../../../shared/@patternfly/react-core";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { SwitchField } from "../component/SwitchField";
import { TextField } from "../component/TextField";

export const ExtendedOAuth2Settings = () => {
    const { t } = useTranslation();

    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <ExpandableSection
            toggleText={t("advanced")}
            onToggle={() => setIsExpanded(!isExpanded)}
            isExpanded={isExpanded}
        >
            <Form isHorizontal>
                <TextField field="config.defaultScope" label="scopes" />
                <SelectControl
                    name="config.prompt"
                    label={t("prompt")}
                    options={[
                        { key: t("prompts.unspecified"), value: "" },
                        { key: t("prompts.none"), value: "none" },
                        { key: t("prompts.consent"), value: "consent" },
                        { key: t("prompts.login"), value: "login" },
                        { key: t("prompts.select_account"), value: "select_account" }
                    ]}
                    controller={{ defaultValue: "" }}
                />
                <SwitchField
                    field="config.acceptsPromptNoneForwardFromClient"
                    label="acceptsPromptNone"
                />
                <SwitchField
                    field="config.requiresShortStateParameter"
                    label="requiresShortStateParameter"
                />
                <NumberControl
                    name="config.allowedClockSkew"
                    label={t("allowedClockSkew")}
                    labelIcon={t("allowedClockSkewHelp")}
                    controller={{ defaultValue: 0, rules: { min: 0 } }}
                />
                <TextField field="config.forwardParameters" label="forwardParameters" />
            </Form>
        </ExpandableSection>
    );
};
