import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { TextControl } from "../../../shared/keycloak-ui-shared";

import { FormAccess } from "../../components/form/FormAccess";
import { useAccess } from "../../context/access/Access";
import { FormFields } from "../ClientDetails";
import type { ClientSettingsProps } from "../ClientSettings";
import { LoginSettings } from "./LoginSettings";

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
