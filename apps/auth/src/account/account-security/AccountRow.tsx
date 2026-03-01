/**
 * This file has been claimed for ownership from @keycloakify/keycloak-account-ui version 260502.0.2.
 * To relinquish ownership and restore this file to its original content, run the following command:
 *
 * $ npx keycloakify own --path "account/account-security/AccountRow.tsx" --revert
 */

/* eslint-disable */

// @ts-nocheck

import { useEnvironment } from "../../shared/keycloak-ui-shared";
import { useTranslation } from "react-i18next";

import { unLinkAccount } from "../api/methods";
import { LinkedAccountRepresentation } from "../api/representations";
import { useAccountAlerts } from "../utils/useAccountAlerts";
import { Button } from "@merge/ui/components/button";
import { Badge } from "@merge/ui/components/badge";
import { Link as LinkIcon, LinkBreak, LinkSimple } from "@phosphor-icons/react";

type AccountRowProps = {
    account: LinkedAccountRepresentation;
    isLinked?: boolean;
    refresh: () => void;
};

export const AccountRow = ({ account, isLinked = false, refresh }: AccountRowProps) => {
    const { t } = useTranslation();
    const context = useEnvironment();
    const { login } = context.keycloak;
    const { addAlert, addError } = useAccountAlerts();

    const unLink = async (account: LinkedAccountRepresentation) => {
        try {
            await unLinkAccount(context, account);
            addAlert(t("unLinkSuccess"));
            refresh();
        } catch (error) {
            addError("unLinkError", error);
        }
    };

    return (
        <div
            id={`${account.providerAlias}-idp`}
            className="rounded-md border p-4"
            data-testid={`linked-accounts/${account.providerName}`}
        >
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded shrink-0 ${isLinked ? 'bg-green-100 dark:bg-green-900/20' : 'bg-muted'}`}>
                        <LinkSimple className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 space-y-1">
                        <div className="text-base font-medium flex items-center gap-2 flex-wrap">
                            <span id={`${account.providerAlias}-idp-name`}>
                                {account.displayName}
                            </span>
                            <Badge
                                variant={account.social ? "secondary" : "default"}
                                id={`${account.providerAlias}-idp-label`}
                            >
                                {t(
                                    account.social
                                        ? "socialLogin"
                                        : "systemDefined"
                                )}
                            </Badge>
                        </div>
                        {account.linkedUsername && (
                            <div
                                className="text-sm text-muted-foreground"
                                id={`${account.providerAlias}-idp-username`}
                            >
                                {account.linkedUsername}
                            </div>
                        )}
                    </div>
                </div>
                <div className="shrink-0">
                    {isLinked ? (
                        <Button
                            id={`${account.providerAlias}-idp-unlink`}
                            variant="outline"
                            size="sm"
                            onClick={() => unLink(account)}
                            className="inline-flex items-center gap-1"
                        >
                            <LinkBreak className="h-4 w-4" />
                            {t("unLink")}
                        </Button>
                    ) : (
                        <Button
                            id={`${account.providerAlias}-idp-link`}
                            variant="default"
                            size="sm"
                            onClick={async () => {
                                await login({
                                    action: "idp_link:" + account.providerAlias
                                });
                            }}
                            className="inline-flex items-center gap-1"
                        >
                            <LinkIcon className="h-4 w-4" />
                            {t("link")}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};
