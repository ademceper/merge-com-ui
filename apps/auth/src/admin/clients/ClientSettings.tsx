/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/clients/ClientSettings.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import type ClientRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientRepresentation";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ScrollForm } from "../../shared/keycloak-ui-shared";
import { ClientDescription } from "./ClientDescription";
import { FormFields } from "./ClientDetails";
import { AccessSettings } from "./add/AccessSettings";
import { CapabilityConfig } from "./add/CapabilityConfig";
import { LoginSettingsPanel } from "./add/LoginSettingsPanel";
import { LogoutPanel } from "./add/LogoutPanel";
import { SamlConfig } from "./add/SamlConfig";
import { SamlSignature } from "./add/SamlSignature";

export type ClientSettingsProps = {
    client: ClientRepresentation;
    save: () => void;
    reset: () => void;
};

export const ClientSettings = (props: ClientSettingsProps) => {
    const { t } = useTranslation();

    const { watch } = useFormContext<FormFields>();
    const protocol = watch("protocol");

    const { client } = props;

    return (
        <ScrollForm
            label={t("jumpToSection")}
            sections={[
                {
                    title: t("generalSettings"),
                    panel: (
                        <form className="flex flex-col gap-5">
                            <ClientDescription
                                protocol={client.protocol}
                                hasConfigureAccess={client.access?.configure}
                            />
                        </form>
                    )
                },
                {
                    title: t("accessSettings"),
                    panel: <AccessSettings {...props} />
                },
                {
                    title: t("samlCapabilityConfig"),
                    isHidden: protocol !== "saml" || client.bearerOnly,
                    panel: <SamlConfig />
                },
                {
                    title: t("signatureAndEncryption"),
                    isHidden: protocol !== "saml" || client.bearerOnly,
                    panel: <SamlSignature />
                },
                {
                    title: t("capabilityConfig"),
                    isHidden: protocol !== "openid-connect" || client.bearerOnly,
                    panel: <CapabilityConfig />
                },
                {
                    title: t("loginSettings"),
                    isHidden: client.bearerOnly,
                    panel: <LoginSettingsPanel access={client.access?.configure} />
                },
                {
                    title: t("logoutSettings"),
                    isHidden: client.bearerOnly,
                    panel: <LogoutPanel {...props} />
                }
            ]}
        />
    );
};
