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

import { Button } from "@merge/ui/components/button";
import { Input } from "@merge/ui/components/input";
import { Label } from "@merge/ui/components/label";
import { Copy } from "@phosphor-icons/react";
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
        <div className="space-y-2">
            <div className="flex items-center gap-1">
                <Label htmlFor="kc-redirect-uri">{t("redirectURI")}</Label>
                <HelpItem helpText={t("redirectURIHelp")} fieldLabelId="redirectURI" />
            </div>
            <div className="flex gap-2">
                <Input id="kc-redirect-uri" readOnly value={`${callbackUrl}/${id}/endpoint`} />
                <Button variant="outline" onClick={() => navigator.clipboard.writeText(`${callbackUrl}/${id}/endpoint`)}>
                    <Copy className="size-4" />
                </Button>
            </div>
        </div>
    );
};
