/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/clients/add/GeneralSettings.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { useTranslation } from "react-i18next";
import { SelectControl } from "../../../shared/keycloak-ui-shared";
import { FormAccess } from "../../components/form/FormAccess";
import { useLoginProviders } from "../../context/server-info/ServerInfoProvider";
import { ClientDescription } from "../ClientDescription";
import { getProtocolName } from "../utils";

export const GeneralSettings = () => {
    const { t } = useTranslation();
    const providers = useLoginProviders();

    return (
        <FormAccess isHorizontal role="manage-clients">
            <SelectControl
                name="protocol"
                label={t("clientType")}
                labelIcon={t("clientTypeHelp")}
                controller={{
                    defaultValue: ""
                }}
                options={providers.map(option => ({
                    key: option,
                    value: getProtocolName(t, option)
                }))}
            />
            <ClientDescription hasConfigureAccess />
        </FormAccess>
    );
};
