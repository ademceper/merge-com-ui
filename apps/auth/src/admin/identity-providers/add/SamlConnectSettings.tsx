/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/identity-providers/add/SamlConnectSettings.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { fetchWithError } from "@keycloak/keycloak-admin-client";
import type IdentityProviderRepresentation from "@keycloak/keycloak-admin-client/lib/defs/identityProviderRepresentation";
import {
    FormErrorText,
    HelpItem,
    TextControl,
    useEnvironment
} from "../../../shared/keycloak-ui-shared";
import { Label } from "@merge/ui/components/label";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { useAdminClient } from "../../admin-client";
import { FileUploadForm } from "../../components/json-file-upload/FileUploadForm";
import { useRealm } from "../../context/realm-context/RealmContext";
import type { Environment } from "../../environment";
import { addTrailingSlash } from "../../util";
import { getAuthorizationHeaders } from "../../utils/getAuthorizationHeaders";
import { DiscoveryEndpointField } from "../component/DiscoveryEndpointField";
import { DescriptorSettings } from "./DescriptorSettings";

type FormFields = IdentityProviderRepresentation & {
    discoveryError: string;
};

export const SamlConnectSettings = () => {
    const { adminClient } = useAdminClient();
    const { environment } = useEnvironment<Environment>();

    const { t } = useTranslation();
    const id = "saml";

    const { realm } = useRealm();
    const {
        setValue,
        setError,
        clearErrors,
        formState: { errors }
    } = useFormContext<FormFields>();

    const setupForm = (result: IdentityProviderRepresentation) => {
        Object.entries(result).map(([key, value]) => setValue(`config.${key}`, value));
    };

    const fileUpload = async (xml: string) => {
        clearErrors("discoveryError");
        if (!xml) {
            return;
        }
        const formData = new FormData();
        formData.append("providerId", id);
        formData.append("file", new Blob([xml]));

        try {
            const response = await fetchWithError(
                `${addTrailingSlash(
                    adminClient.baseUrl
                )}admin/realms/${realm}/identity-provider/import-config`,
                {
                    method: "POST",
                    body: formData,
                    headers: getAuthorizationHeaders(await adminClient.getAccessToken())
                }
            );
            if (response.ok) {
                const result = await response.json();
                setupForm(result);
            } else {
                setError("discoveryError", {
                    type: "manual",
                    message: response.statusText
                });
            }
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
                {t("samlSettings")}
            </h2>

            <TextControl
                name="config.entityId"
                label={t("serviceProviderEntityId")}
                labelIcon={t("serviceProviderEntityIdHelp")}
                defaultValue={`${environment.serverBaseUrl}/realms/${realm}`}
                rules={{
                    required: t("required")
                }}
            />

            <DiscoveryEndpointField
                id="saml"
                fileUpload={
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Label htmlFor="kc-import-config">{t("importConfig")}</Label>
                            <HelpItem
                                helpText={t("importConfigHelp")}
                                fieldLabelId="importConfig"
                            />
                        </div>
                        <FileUploadForm
                            id="kc-import-config"
                            extension=".xml"
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
                {readonly => <DescriptorSettings readOnly={readonly} />}
            </DiscoveryEndpointField>
        </>
    );
};
