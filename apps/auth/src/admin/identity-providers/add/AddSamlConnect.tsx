/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/identity-providers/add/AddSamlConnect.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import type IdentityProviderRepresentation from "@keycloak/keycloak-admin-client/lib/defs/identityProviderRepresentation";
import { Button } from "@merge/ui/components/button";
import { AlertVariant } from "../../../shared/keycloak-ui-shared";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useAdminClient } from "../../admin-client";
import { useAlerts } from "../../../shared/keycloak-ui-shared";
import { FormAccess } from "../../components/form/FormAccess";
import { ViewHeader } from "../../components/view-header/ViewHeader";
import { useRealm } from "../../context/realm-context/RealmContext";
import { toIdentityProvider } from "../routes/IdentityProvider";
import { toIdentityProviders } from "../routes/IdentityProviders";
import { SamlConnectSettings } from "./SamlConnectSettings";
import { SamlGeneralSettings } from "./SamlGeneralSettings";

type DiscoveryIdentityProvider = IdentityProviderRepresentation & {
    discoveryEndpoint?: string;
};

export default function AddSamlConnect() {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const navigate = useNavigate();
    const id = "saml";

    const form = useForm<DiscoveryIdentityProvider>({
        defaultValues: { alias: id, config: { allowCreate: "true" } },
        mode: "onChange"
    });
    const {
        handleSubmit,
        formState: { isDirty }
    } = form;

    const { addAlert, addError } = useAlerts();
    const { realm } = useRealm();

    const onSubmit = async (provider: DiscoveryIdentityProvider) => {
        delete provider.discoveryEndpoint;
        try {
            await adminClient.identityProviders.create({
                ...provider,
                providerId: id
            });
            addAlert(t("createIdentityProviderSuccess"), AlertVariant.success);
            navigate(
                toIdentityProvider({
                    realm,
                    providerId: id,
                    alias: provider.alias!,
                    tab: "settings"
                })
            );
        } catch (error: any) {
            addError("createIdentityProviderError", error);
        }
    };

    return (
        <>
            <ViewHeader titleKey={t("addSamlProvider")} />
            <div className="p-6">
                <FormProvider {...form}>
                    <FormAccess
                        role="manage-identity-providers"
                        isHorizontal
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        <SamlGeneralSettings />
                        <SamlConnectSettings />
                        <div className="flex gap-2">
                            <Button
                                disabled={!isDirty}
                                type="submit"
                                data-testid="createProvider"
                            >
                                {t("add")}
                            </Button>
                            <Button
                                variant="link"
                                data-testid="cancel"
                                asChild
                            >
                                <Link to={toIdentityProviders({ realm })}>
                                    {t("cancel")}
                                </Link>
                            </Button>
                        </div>
                    </FormAccess>
                </FormProvider>
            </div>
        </>
    );
}
