/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/clients/initial-access/CreateInitialAccessToken.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import type ClientInitialAccessPresentation from "@keycloak/keycloak-admin-client/lib/defs/clientInitialAccessPresentation";
import { AlertVariant } from "../../../shared/keycloak-ui-shared";
import { Button } from "@merge/ui/components/button";
import { Label } from "@merge/ui/components/label";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { NumberControl } from "../../../shared/keycloak-ui-shared";
import { useAdminClient } from "../../admin-client";
import { useAlerts } from "../../../shared/keycloak-ui-shared";
import { FormAccess } from "../../components/form/FormAccess";
import { TimeSelectorControl } from "../../components/time-selector/TimeSelectorControl";
import { ViewHeader } from "../../components/view-header/ViewHeader";
import { useRealm } from "../../context/realm-context/RealmContext";
import { toClients } from "../routes/Clients";
import { AccessTokenDialog } from "./AccessTokenDialog";
import { MultiLineInput } from "../../components/multi-line-input/MultiLineInput";
import { HelpItem } from "../../../shared/keycloak-ui-shared";

export default function CreateInitialAccessToken() {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const form = useForm({ mode: "onChange" });
    const {
        handleSubmit,
        formState: { isValid }
    } = form;

    const { realm } = useRealm();
    const { addAlert, addError } = useAlerts();

    const navigate = useNavigate();
    const [token, setToken] = useState("");

    const save = async (clientToken: ClientInitialAccessPresentation) => {
        try {
            const access = await adminClient.realms.createClientsInitialAccess(
                { realm },
                clientToken
            );
            setToken(access.token!);
        } catch (error) {
            addError("tokenSaveError", error);
        }
    };

    return (
        <FormProvider {...form}>
            {token && (
                <AccessTokenDialog
                    token={token}
                    toggleDialog={() => {
                        setToken("");
                        addAlert(t("tokenSaveSuccess"), AlertVariant.success);
                        navigate(toClients({ realm, tab: "initial-access-token" }));
                    }}
                />
            )}
            <ViewHeader titleKey="createToken" subKey="createTokenHelp" />
            <div className="p-6">
                <FormAccess
                    isHorizontal
                    role="create-client"
                    onSubmit={handleSubmit(save)}
                >
                    <TimeSelectorControl
                        name="expiration"
                        label={t("expiration")}
                        labelIcon={t("tokenExpirationHelp")}
                        controller={{
                            defaultValue: 86400,
                            rules: {
                                min: {
                                    value: 1,
                                    message: t("expirationValueNotValid")
                                }
                            }
                        }}
                    />
                    <NumberControl
                        name="count"
                        label={t("count")}
                        labelIcon={t("countHelp")}
                        controller={{
                            rules: {
                                min: 1
                            },
                            defaultValue: 1
                        }}
                    />
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Label>{t("webOrigins")}</Label>
                            <HelpItem
                                helpText={t("webOriginsHelp")}
                                fieldLabelId="webOrigins"
                            />
                        </div>
                        <MultiLineInput
                            id="kc-web-origins"
                            name="webOrigins"
                            aria-label={t("webOrigins")}
                            addButtonLabel="addWebOrigins"
                        />
                    </div>
                    <div className="flex gap-2 mt-4">
                        <Button
                            type="submit"
                            data-testid="save"
                            disabled={!isValid}
                        >
                            {t("save")}
                        </Button>
                        <Button
                            data-testid="cancel"
                            variant="link"
                            asChild
                        >
                            <Link
                                to={toClients({ realm, tab: "initial-access-token" })}
                            >
                                {t("cancel")}
                            </Link>
                        </Button>
                    </div>
                </FormAccess>
            </div>
        </FormProvider>
    );
}
