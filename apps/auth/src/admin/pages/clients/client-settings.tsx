import type ClientRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientRepresentation";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ScrollForm } from "../../../shared/keycloak-ui-shared";
import { FixedButtonsGroup } from "../../shared/ui/form/fixed-button-group";
import { useAccess } from "../../app/providers/access/access";
import { ClientDescription } from "./client-description";
import { FormFields } from "./client-details";
import { AccessSettings } from "./add/access-settings";
import { CapabilityConfig } from "./add/capability-config";
import { LoginSettingsPanel } from "./add/login-settings-panel";
import { LogoutPanel } from "./add/logout-panel";
import { SamlConfig } from "./add/saml-config";
import { SamlSignature } from "./add/saml-signature";

export type ClientSettingsProps = {
    client: ClientRepresentation;
    save: () => void;
    reset: () => void;
};

export const ClientSettings = (props: ClientSettingsProps) => {
    const { t } = useTranslation();
    const { hasAccess } = useAccess();

    const { watch } = useFormContext<FormFields>();
    const protocol = watch("protocol");

    const { client, save, reset } = props;
    const isManager = hasAccess("manage-clients") || client.access?.configure;

    return (
        <ScrollForm
            label={t("jumpToSection")}
            actions={
                <FixedButtonsGroup
                    name="settings"
                    save={save}
                    reset={reset}
                    isDisabled={!isManager}
                />
            }
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
