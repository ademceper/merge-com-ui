import { useFormContext } from "react-hook-form";
import { useTranslation } from "@merge-rd/i18n";
import { TextControl } from "../../../../shared/keycloak-ui-shared";

import { FormAccess } from "../../../shared/ui/form/form-access";
import { useAccess } from "../../../app/providers/access/access";
import { FormFields } from "../client-details";
import type { ClientSettingsProps } from "../client-settings";
import { LoginSettings } from "./login-settings";

export const AccessSettings = ({ client }: ClientSettingsProps) => {
    const { t } = useTranslation();
    const { watch } = useFormContext<FormFields>();

    useAccess();

    const protocol = watch("protocol");

    return (
        <FormAccess
            fineGrainedAccess={client.access?.configure}
            role="manage-clients"
        >
            <div className="flex flex-col gap-5">
            {!client.bearerOnly && <LoginSettings protocol={protocol} />}
            {protocol !== "saml" && (
                <TextControl
                    type="url"
                    name="adminUrl"
                    label={t("adminURL")}
                    labelIcon={t("adminURLHelp")}
                />
            )}
            </div>
        </FormAccess>
    );
};
