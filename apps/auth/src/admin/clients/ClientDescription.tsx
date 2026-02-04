/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/clients/ClientDescription.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { useTranslation } from "react-i18next";
import { TextControl, TextAreaControl } from "../../shared/keycloak-ui-shared";

import { FormAccess } from "../components/form/FormAccess";
import { DefaultSwitchControl } from "../components/SwitchControl";

type ClientDescriptionProps = {
    protocol?: string;
    hasConfigureAccess?: boolean;
};

export const ClientDescription = ({
    hasConfigureAccess: configure
}: ClientDescriptionProps) => {
    const { t } = useTranslation();
    return (
        <FormAccess role="manage-clients" fineGrainedAccess={configure} unWrap>
            <div className="flex flex-col gap-5">
                <TextControl
                    name="clientId"
                    label={t("clientId")}
                    labelIcon={t("clientIdHelp")}
                    rules={{ required: t("required") }}
                />
                <TextControl name="name" label={t("name")} labelIcon={t("clientNameHelp")} />
                <TextAreaControl
                    name="description"
                    label={t("description")}
                    labelIcon={t("clientDescriptionHelp")}
                    rules={{
                        maxLength: {
                            value: 255,
                            message: t("maxLength", { length: 255 })
                        }
                    }}
                />
                <DefaultSwitchControl
                    name="alwaysDisplayInConsole"
                    label={t("alwaysDisplayInUI")}
                    labelIcon={t("alwaysDisplayInUIHelp")}
                />
            </div>
        </FormAccess>
    );
};
