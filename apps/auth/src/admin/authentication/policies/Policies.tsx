/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/authentication/policies/Policies.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@merge/ui/components/tabs";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { KeycloakSpinner } from "../../../shared/keycloak-ui-shared";
import { useRealm } from "../../context/realm-context/RealmContext";
import { CibaPolicy } from "./CibaPolicy";
import { OtpPolicy } from "./OtpPolicy";
import { PasswordPolicy } from "./PasswordPolicy";
import { WebauthnPolicy } from "./WebauthnPolicy";

export const Policies = () => {
    const { t } = useTranslation();
    const [subTab, setSubTab] = useState(1);
    const { realmRepresentation: realm, refresh } = useRealm();

    if (!realm) {
        return <KeycloakSpinner />;
    }

    return (
        <Tabs value={String(subTab)} onValueChange={(val) => setSubTab(Number(val))}>
            <TabsList>
                <TabsTrigger value="1" data-testid="passwordPolicy">{t("passwordPolicy")}</TabsTrigger>
                <TabsTrigger value="2" data-testid="otpPolicy">{t("otpPolicy")}</TabsTrigger>
                <TabsTrigger value="3" data-testid="webauthnPolicy">{t("webauthnPolicy")}</TabsTrigger>
                <TabsTrigger value="4" data-testid="webauthnPasswordlessPolicy">{t("webauthnPasswordlessPolicy")}</TabsTrigger>
                <TabsTrigger value="5" data-testid="tab-ciba-policy">{t("cibaPolicy")}</TabsTrigger>
            </TabsList>
            <TabsContent value="1">
                <PasswordPolicy realm={realm} realmUpdated={refresh} />
            </TabsContent>
            <TabsContent value="2">
                <OtpPolicy realm={realm} realmUpdated={refresh} />
            </TabsContent>
            <TabsContent value="3">
                <WebauthnPolicy realm={realm} realmUpdated={refresh} />
            </TabsContent>
            <TabsContent value="4">
                <WebauthnPolicy realm={realm} realmUpdated={refresh} isPasswordLess />
            </TabsContent>
            <TabsContent value="5">
                <CibaPolicy realm={realm} realmUpdated={refresh} />
            </TabsContent>
        </Tabs>
    );
};
