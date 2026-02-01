/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/identity-providers/add/GeneralSettings.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { ClientIdSecret } from "../component/ClientIdSecret";
import { DisplayOrder } from "../component/DisplayOrder";
import { RedirectUrl } from "../component/RedirectUrl";
import { TextControl } from "../../../shared/keycloak-ui-shared";
import { useTranslation } from "react-i18next";
import { useFormContext, useWatch } from "react-hook-form";
import { useParams } from "react-router-dom";
import type { IdentityProviderParams } from "../routes/IdentityProvider";

type GeneralSettingsProps = {
    id: string;
    create?: boolean;
};

export const GeneralSettings = ({ create = true, id }: GeneralSettingsProps) => {
    const { t } = useTranslation();
    const { control } = useFormContext();
    const alias = useWatch({ control, name: "alias" });
    const { tab } = useParams<IdentityProviderParams>();

    return (
        <>
            <RedirectUrl id={alias ? alias : id} />

            <TextControl
                name="alias"
                label={t("alias")}
                labelIcon={t("aliasHelp")}
                readOnly={tab === "settings"}
                rules={{
                    required: t("required")
                }}
            />

            <TextControl name="displayName" label={t("displayName")} />
            <ClientIdSecret create={create} />
            <DisplayOrder />
        </>
    );
};
