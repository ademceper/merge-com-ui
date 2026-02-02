/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/identity-providers/add/OpenIdConnectSettings.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { Label } from "@merge/ui/components/label";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FormErrorText, HelpItem } from "../../../shared/keycloak-ui-shared";
import { useAdminClient } from "../../admin-client";
import { JsonFileUpload } from "../../components/json-file-upload/JsonFileUpload";
import { DiscoveryEndpointField } from "../component/DiscoveryEndpointField";
import { DiscoverySettings } from "./DiscoverySettings";

type OpenIdConnectSettingsProps = {
    isOIDC: boolean;
};

export const OpenIdConnectSettings = ({ isOIDC }: OpenIdConnectSettingsProps) => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const id = "oidc";

    const {
        setValue,
        setError,
        clearErrors,
        formState: { errors }
    } = useFormContext();

    const setupForm = (result: any) => {
        Object.keys(result).map(k => setValue(`config.${k}`, result[k]));
    };

    const fileUpload = async (obj?: object) => {
        clearErrors("discoveryError");
        if (!obj) {
            return;
        }

        const formData = new FormData();
        formData.append("providerId", id);
        formData.append("file", new Blob([JSON.stringify(obj)]));

        try {
            const result = await adminClient.identityProviders.importFromUrl(formData);
            setupForm(result);
        } catch (error) {
            setError("discoveryError", {
                type: "manual",
                message: (error as Error).message
            });
        }
    };

    return (
        <>
            <h2 className="text-xl font-bold">
                {isOIDC ? t("oidcSettings") : t("oAuthSettings")}
            </h2>

            <DiscoveryEndpointField
                id="oidc"
                fileUpload={
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Label htmlFor="kc-import-config">{t("importConfig")}</Label>
                            <HelpItem
                                helpText={t("importConfigHelp")}
                                fieldLabelId="importConfig"
                            />
                        </div>
                        <JsonFileUpload
                            id="kc-import-config"
                            helpText={t("identity=providers-help:jsonFileUpload")}
                            hideDefaultPreview
                            unWrap
                            validated={errors.discoveryError ? "error" : "default"}
                            onChange={value => fileUpload(value)}
                        />
                        {errors.discoveryError && (
                            <FormErrorText
                                message={errors.discoveryError.message as string}
                            />
                        )}
                    </div>
                }
            >
                {readonly => <DiscoverySettings readOnly={readonly} isOIDC={isOIDC} />}
            </DiscoveryEndpointField>
        </>
    );
};
