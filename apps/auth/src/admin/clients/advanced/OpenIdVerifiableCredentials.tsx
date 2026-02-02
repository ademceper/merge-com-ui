/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/clients/advanced/OpenIdVerifiableCredentials.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { Button } from "@merge/ui/components/button";
import { useTranslation } from "react-i18next";
import { FormAccess } from "../../components/form/FormAccess";
import { convertAttributeNameToForm } from "../../util";
import { FormFields, SaveOptions } from "../ClientDetails";
import ClientRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientRepresentation";
import { DefaultSwitchControl } from "../../components/SwitchControl";

type OpenIdVerifiableCredentialsProps = {
    client: ClientRepresentation;
    save: (options?: SaveOptions) => void;
    reset: () => void;
};

export const OpenIdVerifiableCredentials = ({
    save,
    reset
}: OpenIdVerifiableCredentialsProps) => {
    const { t } = useTranslation();

    return (
        <FormAccess role="manage-clients" isHorizontal>
            <DefaultSwitchControl
                name={convertAttributeNameToForm<FormFields>(
                    "attributes.oid4vci.enabled"
                )}
                label={t("oid4vciEnabled")}
                labelIcon={t("oid4vciEnabledHelp")}
                stringify
            />
            <div className="flex gap-2">
                <Button
                    variant="secondary"
                    id="oid4vciSave"
                    data-testid="oid4vciSave"
                    onClick={() => save()}
                >
                    {t("save")}
                </Button>
                <Button
                    id="oid4vciRevert"
                    data-testid="oid4vciRevert"
                    variant="link"
                    onClick={reset}
                >
                    {t("revert")}
                </Button>
            </div>
        </FormAccess>
    );
};
