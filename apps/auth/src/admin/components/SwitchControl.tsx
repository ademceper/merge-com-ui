/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/components/SwitchControl.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { FieldPath, FieldValues } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { SwitchControlProps } from "../../shared/keycloak-ui-shared";
import { SwitchControl } from "../../shared/keycloak-ui-shared";

export type DefaultSwitchControlProps<
    T extends FieldValues,
    P extends FieldPath<T> = FieldPath<T>
> = Omit<SwitchControlProps<T, P>, "labelOn" | "labelOff">;

export const DefaultSwitchControl = <
    T extends FieldValues,
    P extends FieldPath<T> = FieldPath<T>
>(
    props: DefaultSwitchControlProps<T, P>
) => {
    const { t } = useTranslation();

    return <SwitchControl {...props} labelOn={t("on")} labelOff={t("off")} />;
};
