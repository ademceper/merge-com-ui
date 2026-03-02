/**
 * This file has been claimed for ownership from @keycloakify/keycloak-account-ui version 260502.0.2.
 * To relinquish ownership and restore this file to its original content, run the following command:
 *
 * $ npx keycloakify own --path "account/account-security/SigningIn.tsx" --revert
 */

/* eslint-disable */

// @ts-nocheck

import { Fragment, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useEnvironment } from "../../shared/keycloak-ui-shared";
import { getCredentials } from "../api/methods";
import {
    CredentialContainer,
    CredentialMetadataRepresentation
} from "../api/representations";
import { EmptyRow } from "../components/datalist/EmptyRow";
import { Page } from "../components/page/Page";
import { TFuncKey } from "../i18n";
import { formatDate } from "../utils/formatDate";
import { usePromise } from "../utils/usePromise";
import { Link } from "@merge/ui/components/link";
import { Separator } from "@merge/ui/components/separator";

export const SigningIn = () => {
    const { t } = useTranslation();
    const context = useEnvironment();
    const { login } = context.keycloak;

    const [credentials, setCredentials] = useState<CredentialContainer[]>();

    usePromise(signal => getCredentials({ signal, context }), setCredentials, []);

    if (!credentials) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    const credentialUniqueCategories = [...new Set(credentials.map(c => c.category))];

    return (
        <Page title={t("signingIn")} description={t("signingInDescription")}>
            <div className="space-y-6">
                {credentialUniqueCategories.map(category => (
                    <div key={category} className="space-y-4">
                        {credentials
                            .filter(cred => cred.category == category)
                            .map(container => (
                                <div key={container.type} className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-base font-semibold" id={`${category}-categ-title`}>
                                            {t(category as TFuncKey)}
                                        </h2>
                                        {container.createAction && (
                                            <Link
                                                href="#"
                                                onClick={(e) => { e.preventDefault(); login({ action: container.createAction }); }}
                                                className="text-foreground text-sm font-medium shrink-0"
                                                data-testid={`${container.type}/create`}
                                            >
                                                {t("setUpNew", {
                                                    name: t(`${container.type}-display-name` as TFuncKey)
                                                })}
                                            </Link>
                                        )}
                                    </div>

                                    <div
                                        className="space-y-2"
                                        data-testid={`${container.type}/credential-list`}
                                    >
                                        {container.userCredentialMetadatas.length === 0 && (
                                            <EmptyRow
                                                message={t("notSetUp", {
                                                    name: t(container.displayName as TFuncKey)
                                                })}
                                                data-testid={`${container.type}/not-set-up`}
                                            />
                                        )}

                                        {container.userCredentialMetadatas.map(meta => {
                                            const credential = meta.credential;
                                            return (
                                                <div
                                                    key={credential.id}
                                                    id={`cred-${credential.id}`}
                                                    className="flex items-center justify-between py-2"
                                                >
                                                    <div className="min-w-0 space-y-0.5">
                                                        <p
                                                            className="text-sm font-medium truncate max-w-75"
                                                            data-testrole="label"
                                                        >
                                                            {container.type === "password"
                                                                ? t(container.displayName as TFuncKey)
                                                                : credential.userLabel || t(container.displayName as TFuncKey)}
                                                        </p>
                                                        {credential.createdDate && (
                                                            <p
                                                                className="text-xs text-muted-foreground"
                                                                data-testrole="created-at"
                                                            >
                                                                <Trans i18nKey="credentialCreatedAt">
                                                                    <strong className="mr-1"></strong>
                                                                    {{
                                                                        date: formatDate(
                                                                            new Date(credential.createdDate)
                                                                        )
                                                                    }}
                                                                </Trans>
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-3 shrink-0">
                                                        {container.updateAction && (
                                                            <Link
                                                                href="#"
                                                                onClick={async (e) => { e.preventDefault(); await login({ action: container.updateAction }); }}
                                                                className="text-foreground text-sm font-medium"
                                                                data-testrole="update"
                                                            >
                                                                {t("update")}
                                                            </Link>
                                                        )}
                                                        {container.removeable && (
                                                            <Link
                                                                href="#"
                                                                onClick={async (e) => { e.preventDefault(); await login({ action: "delete_credential:" + credential.id }); }}
                                                                className="text-destructive hover:text-destructive text-sm font-medium"
                                                                data-testrole="remove"
                                                            >
                                                                {t("delete")}
                                                            </Link>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <Separator />
                                </div>
                            ))}
                    </div>
                ))}
            </div>
        </Page>
    );
};

export default SigningIn;
