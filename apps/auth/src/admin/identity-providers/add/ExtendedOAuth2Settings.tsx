import { NumberControl, SelectControl } from "../../../shared/keycloak-ui-shared";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@merge/ui/components/collapsible";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { SwitchField } from "../component/SwitchField";
import { TextField } from "../component/TextField";

export const ExtendedOAuth2Settings = () => {
    const { t } = useTranslation();

    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger className="flex items-center gap-2 py-2 cursor-pointer text-sm font-medium">
                {t("advanced")}
            </CollapsibleTrigger>
            <CollapsibleContent>
            <form>
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
            </form>
            </CollapsibleContent>
        </Collapsible>
    );
};
