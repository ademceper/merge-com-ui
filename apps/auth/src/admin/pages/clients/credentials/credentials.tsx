import type ClientRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientRepresentation";
import type CredentialRepresentation from "@keycloak/keycloak-admin-client/lib/defs/credentialRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Alert, AlertTitle } from "@merge-rd/ui/components/alert";
import { Button } from "@merge-rd/ui/components/button";
import { Label } from "@merge-rd/ui/components/label";
import { Separator } from "@merge-rd/ui/components/separator";
import { useEffect, useMemo, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { toast } from "sonner";
import {
    getErrorDescription,
    getErrorMessage,
    HelpItem,
    SelectField
} from "@/shared/keycloak-ui-shared";
import { useServerInfo } from "@/admin/app/providers/server-info/server-info-provider";
import { useRegenerateClientSecret } from "../hooks/use-regenerate-client-secret";
import { useRegenerateAccessToken } from "../hooks/use-regenerate-access-token";
import { convertAttributeNameToForm } from "@/admin/shared/lib/util";
import { useConfirmDialog } from "@/admin/shared/ui/confirm-dialog/confirm-dialog";
import { DynamicComponents } from "@/admin/shared/ui/dynamic/dynamic-components";
import { FormAccess } from "@/admin/shared/ui/form/form-access";
import { useClientCredentials } from "../hooks/use-client-credentials";
import type { FormFields } from "../client-details";
import { ClientSecret } from "./client-secret";
import { SignedJWT } from "./signed-jwt";
import { X509 } from "./x509";

type AccessToken = {
    registrationAccessToken: string;
};

type CredentialsProps = {
    client: ClientRepresentation;
    save: () => void;
    refresh: () => void;
};

export const Credentials = ({ client, save, refresh }: CredentialsProps) => {

    const { t } = useTranslation();
    const clientId = client.id!;
    const { mutateAsync: regenerateClientSecretMutation } = useRegenerateClientSecret();
    const { mutateAsync: regenerateAccessTokenMutation } = useRegenerateAccessToken();

    const { data: credentialsData } = useClientCredentials(clientId);
    const providers = credentialsData?.providers ?? [];

    const {
        control,
        formState: { isDirty },
        handleSubmit
    } = useFormContext<FormFields>();

    const clientAuthenticatorType = useWatch({
        control: control,
        name: "clientAuthenticatorType",
        defaultValue: ""
    });

    const [secret, setSecret] = useState("");
    const [accessToken, setAccessToken] = useState("");

    useEffect(() => {
        if (credentialsData?.secret) {
            setSecret(credentialsData.secret);
        }
    }, [credentialsData]);

    const selectedProvider = providers.find(
        provider => provider.id === clientAuthenticatorType
    );

    const { componentTypes } = useServerInfo();
    const providerProperties = useMemo(
        () =>
            componentTypes?.["org.keycloak.authentication.ClientAuthenticator"]?.find(
                p => p.id === clientAuthenticatorType
            )?.clientProperties,
        [clientAuthenticatorType, componentTypes]
    );

    async function regenerate<T>(
        call: (clientId: string) => Promise<T>,
        message: string
    ): Promise<T | undefined> {
        try {
            const data = await call(clientId);
            toast.success(t(`${message}Success`));
            return data;
        } catch (error) {
            toast.error(t(`${message}Error`, { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        }
    }

    const regenerateClientSecret = async () => {
        const secret = await regenerate<CredentialRepresentation>(
            cId => regenerateClientSecretMutation(cId),
            "clientSecret"
        );
        setSecret(secret?.value || "");
        refresh();
    };

    const [toggleClientSecretConfirm, ClientSecretConfirm] = useConfirmDialog({
        titleKey: "confirmClientSecretTitle",
        messageKey: "confirmClientSecretBody",
        continueButtonLabel: "yes",
        cancelButtonLabel: "no",
        onConfirm: regenerateClientSecret
    });

    const regenerateAccessToken = async () => {
        const accessToken = await regenerate<AccessToken>(
            cId => regenerateAccessTokenMutation(cId),
            "accessToken"
        );
        setAccessToken(accessToken?.registrationAccessToken || "");
    };

    const [toggleAccessTokenConfirm, AccessTokenConfirm] = useConfirmDialog({
        titleKey: "confirmAccessTokenTitle",
        messageKey: "confirmAccessTokenBody",
        continueButtonLabel: "yes",
        cancelButtonLabel: "no",
        onConfirm: regenerateAccessToken
    });

    return (
        <div className="p-6">
            <FormAccess
                onSubmit={handleSubmit(save)}
                isHorizontal
                className="mt-4"
                role="manage-clients"
                fineGrainedAccess={client.access?.configure}
            >
                <ClientSecretConfirm />
                <AccessTokenConfirm />
                <div className="border rounded-lg">
                    <div className="p-4">
                        <SelectField
                            name="clientAuthenticatorType"
                            label={t("clientAuthenticator")}
                            labelIcon={t("clientAuthenticatorTypeHelp")}
                            defaultValue=""
                            options={providers.map(({ id, displayName }) => ({
                                key: id!,
                                value: displayName || id!
                            }))}
                        />
                        {(clientAuthenticatorType === "client-jwt" ||
                            clientAuthenticatorType === "client-secret-jwt") && (
                            <SignedJWT
                                clientAuthenticatorType={clientAuthenticatorType}
                            />
                        )}
                        {clientAuthenticatorType === "client-jwt" && (
                            <div>
                                <Alert>
                                    <AlertTitle>{t("signedJWTConfirm")}</AlertTitle>
                                </Alert>
                            </div>
                        )}
                        {clientAuthenticatorType === "client-x509" && <X509 />}
                        {providerProperties && (
                            <form>
                                <DynamicComponents
                                    properties={providerProperties}
                                    convertToName={name =>
                                        convertAttributeNameToForm(`attributes.${name}`)
                                    }
                                />
                            </form>
                        )}
                        <div className="flex gap-2 mt-4">
                            <Button type="submit" disabled={!isDirty}>
                                {t("save")}
                            </Button>
                        </div>
                    </div>
                    {selectedProvider?.supportsSecret && (
                        <>
                            <Separator />
                            <div className="p-4">
                                <ClientSecret
                                    client={client}
                                    secret={secret}
                                    toggle={toggleClientSecretConfirm}
                                />
                            </div>
                        </>
                    )}
                </div>
                <div className="border rounded-lg">
                    <div className="p-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Label>{t("registrationAccessToken")}</Label>
                                <HelpItem
                                    helpText={t("registrationAccessTokenHelp")}
                                    fieldLabelId="registrationAccessToken"
                                />
                            </div>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <code
                                        className="block p-2 bg-muted rounded text-sm break-all"
                                        id="kc-access-token"
                                    >
                                        {accessToken}
                                    </code>
                                </div>
                                <Button
                                    variant="secondary"
                                    onClick={toggleAccessTokenConfirm}
                                >
                                    {t("regenerate")}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </FormAccess>
        </div>
    );
};
