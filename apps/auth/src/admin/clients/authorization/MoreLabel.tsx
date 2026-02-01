/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/clients/authorization/MoreLabel.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { useTranslation } from "react-i18next";
import { Label } from "../../../shared/@patternfly/react-core";

type MoreLabelProps = {
    array: unknown[] | undefined;
};

export const MoreLabel = ({ array }: MoreLabelProps) => {
    const { t } = useTranslation();

    if (!array || array.length <= 1) {
        return null;
    }
    return <Label color="blue">{t("more", { count: array.length - 1 })}</Label>;
};
