/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/clients/add/SamlConfig.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { Path, PathValue } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { SelectControl } from "../../../shared/keycloak-ui-shared";
import { DefaultSwitchControl } from "../../components/SwitchControl";
import { FormAccess } from "../../components/form/FormAccess";
import { convertAttributeNameToForm } from "../../util";
import { FormFields } from "../ClientDetails";

type ToggleProps = {
    name: PathValue<FormFields, Path<FormFields>>;
    label: string;
};
export const Toggle = ({ name, label }: ToggleProps) => {
    const { t } = useTranslation();

    return (
        <DefaultSwitchControl
            name={name}
            label={t(label)}
            labelIcon={t(`${label}Help`)}
            stringify
        />
    );
};

export const SamlConfig = () => {
    const { t } = useTranslation();

    return (
        <FormAccess
            role="manage-clients"
            className="keycloak__capability-config__form"
        >
            <div className="flex flex-col gap-5">
            <SelectControl
                name="attributes.saml_name_id_format"
                label={t("nameIdFormat")}
                labelIcon={t("nameIdFormatHelp")}
                controller={{
                    defaultValue: "username"
                }}
                options={["username", "email", "transient", "persistent"]}
                triggerClassName="py-1 dark:border-transparent"
                triggerStyle={{ height: "3rem", minHeight: "3rem" }}
            />
            <Toggle
                name="attributes.saml_force_name_id_format"
                label="forceNameIdFormat"
            />
            <Toggle
                name={convertAttributeNameToForm("attributes.saml.force.post.binding")}
                label="forcePostBinding"
            />
            <Toggle
                name={convertAttributeNameToForm("attributes.saml.artifact.binding")}
                label="forceArtifactBinding"
            />
            <Toggle
                name={convertAttributeNameToForm("attributes.saml.authnstatement")}
                label="includeAuthnStatement"
            />
            <Toggle
                name={convertAttributeNameToForm("attributes.saml.onetimeuse.condition")}
                label="includeOneTimeUseCondition"
            />
            <Toggle
                name={convertAttributeNameToForm(
                    "attributes.saml.server.signature.keyinfo.ext"
                )}
                label="optimizeLookup"
            />
            <Toggle
                name={convertAttributeNameToForm("attributes.saml.allow.ecp.flow")}
                label="allowEcpFlow"
            />
            </div>
        </FormAccess>
    );
};
