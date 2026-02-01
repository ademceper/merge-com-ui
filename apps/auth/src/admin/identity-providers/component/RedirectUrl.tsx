/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/identity-providers/component/RedirectUrl.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { ClipboardCopy, FormGroup } from "../../../shared/@patternfly/react-core";
import { useTranslation } from "react-i18next";
import { HelpItem, useEnvironment } from "../../../shared/keycloak-ui-shared";
import { useRealm } from "../../context/realm-context/RealmContext";
import { addTrailingSlash } from "../../util";

export const RedirectUrl = ({ id }: { id: string }) => {
    const { environment } = useEnvironment();
    const { t } = useTranslation();

    const { realm } = useRealm();
    const callbackUrl = `${addTrailingSlash(
        environment.serverBaseUrl
    )}realms/${realm}/broker`;

    return (
        <FormGroup
            label={t("redirectURI")}
            labelIcon={
                <HelpItem helpText={t("redirectURIHelp")} fieldLabelId="redirectURI" />
            }
            fieldId="kc-redirect-uri"
        >
            <ClipboardCopy isReadOnly>{`${callbackUrl}/${id}/endpoint`}</ClipboardCopy>
        </FormGroup>
    );
};
