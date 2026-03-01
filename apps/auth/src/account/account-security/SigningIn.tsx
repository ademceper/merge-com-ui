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
import { Button } from "@merge/ui/components/button";
import { Badge } from "@merge/ui/components/badge";
import { Info, Warning } from "@phosphor-icons/react";

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
            <div className="space-y-8">
                {credentialUniqueCategories.map(category => (
                    <div key={category}>
                        <h2 className="text-xl font-semibold mb-4" id={`${category}-categ-title`}>
                            {t(category as TFuncKey)}
                        </h2>
                        {credentials
                            .filter(cred => cred.category == category)
                            .map(container => (
                                <Fragment key={container.type}>
                                    <div className="flex items-start justify-between mb-4 mt-6">
                                        <div>
                                            <h3
                                                className="text-base font-medium mb-1"
                                                data-testid={`${container.type}/help`}
                                            >
                                                <span data-testid={`${container.type}/title`}>
                                                    {t(container.displayName as TFuncKey)}
                                                </span>
                                            </h3>
                                            <span
                                                className="text-sm text-muted-foreground"
                                                data-testid={`${container.type}/help-text`}
                                            >
                                                {t(container.helptext as TFuncKey)}
                                            </span>
                                        </div>
                                        {container.createAction && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    login({
                                                        action: container.createAction
                                                    })
                                                }
                                                data-testid={`${container.type}/create`}
                                            >
                                                {t("setUpNew", {
                                                    name: t(
                                                        `${container.type}-display-name` as TFuncKey
                                                    )
                                                })}
                                            </Button>
                                        )}
                                    </div>

                                    <div
                                        className="space-y-3 mb-6"
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
                                                    className="rounded-md border p-4"
                                                >
                                                    <div className="flex items-center justify-between gap-4">
                                                        <div className="min-w-0 space-y-1">
                                                            <div
                                                                className="text-sm font-medium truncate max-w-[300px]"
                                                                data-testrole="label"
                                                            >
                                                                {t(credential.userLabel) ||
                                                                    t(credential.type as TFuncKey)}
                                                            </div>
                                                            {credential.createdDate && (
                                                                <div
                                                                    className="text-xs text-muted-foreground"
                                                                    data-testrole="created-at"
                                                                >
                                                                    <Trans i18nKey="credentialCreatedAt">
                                                                        <strong className="mr-2"></strong>
                                                                        {{
                                                                            date: formatDate(
                                                                                new Date(
                                                                                    credential.createdDate
                                                                                )
                                                                            )
                                                                        }}
                                                                    </Trans>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex gap-2 shrink-0">
                                                            {container.removeable && (
                                                                <Button
                                                                    variant="destructive"
                                                                    size="sm"
                                                                    data-testrole="remove"
                                                                    onClick={async () => {
                                                                        await login({
                                                                            action:
                                                                                "delete_credential:" +
                                                                                credential.id
                                                                        });
                                                                    }}
                                                                >
                                                                    {t("delete")}
                                                                </Button>
                                                            )}
                                                            {container.updateAction && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={async () => {
                                                                        await login({
                                                                            action: container.updateAction
                                                                        });
                                                                    }}
                                                                    data-testrole="update"
                                                                >
                                                                    {t("update")}
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {(meta.infoMessage ||
                                                        meta.infoProperties ||
                                                        (meta.warningMessageTitle &&
                                                            meta.warningMessageDescription)) && (
                                                        <div className="mt-3 pt-3 border-t space-y-2">
                                                            {meta.infoMessage && (
                                                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                                    <Info className="h-4 w-4 shrink-0" />
                                                                    {t(
                                                                        meta.infoMessage.key,
                                                                        meta.infoMessage.parameters?.reduce(
                                                                            (acc, val, idx) => ({
                                                                                ...acc,
                                                                                [idx]: val
                                                                            }),
                                                                            {}
                                                                        )
                                                                    )}
                                                                </p>
                                                            )}
                                                            {meta.infoProperties && (
                                                                <div className="flex items-start gap-2">
                                                                    <Info className="h-4 w-4 shrink-0 mt-0.5" />
                                                                    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                                                                        {meta.infoProperties.map(
                                                                            prop => (
                                                                                <Fragment key={prop.key}>
                                                                                    <dt className="font-medium">
                                                                                        {t(prop.key)}
                                                                                    </dt>
                                                                                    <dd className="text-muted-foreground">
                                                                                        {prop.parameters
                                                                                            ? prop.parameters[0]
                                                                                            : ""}
                                                                                    </dd>
                                                                                </Fragment>
                                                                            )
                                                                        )}
                                                                    </dl>
                                                                </div>
                                                            )}
                                                            {meta.warningMessageTitle &&
                                                                meta.warningMessageDescription && (
                                                                    <div className="text-sm text-amber-600 dark:text-amber-400 space-y-1">
                                                                        <p className="flex items-center gap-1">
                                                                            <Warning className="h-4 w-4 shrink-0" />
                                                                            {t(
                                                                                meta.warningMessageTitle.key,
                                                                                meta.warningMessageTitle.parameters?.reduce(
                                                                                    (acc, val, idx) => ({
                                                                                        ...acc,
                                                                                        [idx]: val
                                                                                    }),
                                                                                    {}
                                                                                )
                                                                            )}
                                                                        </p>
                                                                        <p>
                                                                            {t(
                                                                                meta.warningMessageDescription
                                                                                    .key,
                                                                                meta.warningMessageDescription.parameters?.reduce(
                                                                                    (acc, val, idx) => ({
                                                                                        ...acc,
                                                                                        [idx]: val
                                                                                    }),
                                                                                    {}
                                                                                )
                                                                            )}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </Fragment>
                            ))}
                    </div>
                ))}
            </div>
        </Page>
    );
};

export default SigningIn;
