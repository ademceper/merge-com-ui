/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/ForbiddenSection.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { useTranslation } from "react-i18next";
import { PageSection } from "../shared/@patternfly/react-core";

import type { AccessType } from "@keycloak/keycloak-admin-client/lib/defs/whoAmIRepresentation";

type ForbiddenSectionProps = {
    permissionNeeded: AccessType | AccessType[];
};

export const ForbiddenSection = ({ permissionNeeded }: ForbiddenSectionProps) => {
    const { t } = useTranslation();
    const permissionNeededArray = Array.isArray(permissionNeeded)
        ? permissionNeeded
        : [permissionNeeded];

    return (
        <PageSection>
            {t("forbidden", { count: permissionNeededArray.length })}{" "}
            {permissionNeededArray.map(p => p.toString()).join(", ")}
        </PageSection>
    );
};
