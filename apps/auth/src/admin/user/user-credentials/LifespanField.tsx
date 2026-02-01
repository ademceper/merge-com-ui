/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/user/user-credentials/LifespanField.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { useTranslation } from "react-i18next";
import { TimeSelectorControl } from "../../components/time-selector/TimeSelectorControl";

export const LifespanField = () => {
    const { t } = useTranslation();

    return (
        <TimeSelectorControl
            name="lifespan"
            label={t("lifespan")}
            labelIcon={t("lifespanHelp")}
            units={["minute", "hour", "day"]}
            menuAppendTo="parent"
            controller={{}}
        />
    );
};
