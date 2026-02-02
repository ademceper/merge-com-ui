/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/identity-providers/add/SamlGeneralSettings.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import {
    HelpItem,
    TextControl,
    useEnvironment
} from "../../../shared/keycloak-ui-shared";
import { Label } from "@merge/ui/components/label";
import { useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { FormattedLink } from "../../components/external-link/FormattedLink";
import { useRealm } from "../../context/realm-context/RealmContext";
import type { Environment } from "../../environment";
import { DisplayOrder } from "../component/DisplayOrder";
import { RedirectUrl } from "../component/RedirectUrl";


type SamlGeneralSettingsProps = {
    isAliasReadonly?: boolean;
};

export const SamlGeneralSettings = ({
    isAliasReadonly = false
}: SamlGeneralSettingsProps) => {
    const { t } = useTranslation();
    const { realm } = useRealm();
    const { environment } = useEnvironment<Environment>();

    const { control } = useFormContext();
    const alias = useWatch({ control, name: "alias" });

    return (
        <>
            <RedirectUrl id={alias} />

            <TextControl
                name="alias"
                label={t("alias")}
                labelIcon={t("aliasHelp")}
                readOnly={isAliasReadonly}
                rules={{
                    required: t("required")
                }}
            />

            <TextControl name="displayName" label={t("displayName")} />
            <DisplayOrder />
            {isAliasReadonly && (
                <div className="keycloak__identity-providers__saml_link space-y-2">
                    <Label htmlFor="endpoints" className="flex items-center gap-1">
                        {t("endpoints")}
                        <HelpItem helpText={t("aliasHelp")} fieldLabelId="alias" />
                    </Label>
                    <FormattedLink
                        title={t("samlEndpointsLabel")}
                        href={`${environment.adminBaseUrl}/realms/${realm}/broker/${alias}/endpoint/descriptor`}
                        isInline
                    />
                </div>
            )}
        </>
    );
};
