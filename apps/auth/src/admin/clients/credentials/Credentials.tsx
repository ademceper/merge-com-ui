import type { AuthenticationProviderRepresentation } from "@keycloak/keycloak-admin-client/lib/defs/authenticatorConfigRepresentation";
import type ClientRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientRepresentation";
import type CredentialRepresentation from "@keycloak/keycloak-admin-client/lib/defs/credentialRepresentation";
import { getErrorDescription, getErrorMessage, HelpItem,
    SelectControl,
    useFetch } from "../../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { Alert, AlertTitle } from "@merge/ui/components/alert";
import { Button } from "@merge/ui/components/button";
import { Label } from "@merge/ui/components/label";
import { Separator } from "@merge/ui/components/separator";
import { useMemo, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../../admin-client";
import { useConfirmDialog } from "../../components/confirm-dialog/ConfirmDialog";
import { DynamicComponents } from "../../components/dynamic/DynamicComponents";
import { FormAccess } from "../../components/form/FormAccess";
import { useServerInfo } from "../../context/server-info/ServerInfoProvider";
import { FormFields } from "../ClientDetails";
import { ClientSecret } from "./ClientSecret";
import { SignedJWT } from "./SignedJWT";
import { X509 } from "./X509";
import { convertAttributeNameToForm } from "../../util";

type AccessToken = {
    registrationAccessToken: string;
};

export type CredentialsProps = {
    client: ClientRepresentation;
    save: () => void;
    refresh: () => void;
};

export const Credentials = ({ client, save, refresh }: CredentialsProps) => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
const clientId = client.id!;

    const [providers, setProviders] = useState<AuthenticationProviderRepresentation[]>(
        []
    );

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

    useFetch(
        () =>
            Promise.all([
                adminClient.authenticationManagement.getClientAuthenticatorProviders(),
                adminClient.clients.getClientSecret({
                    id: clientId
                })
            ]),
        ([providers, secret]) => {
            setProviders(providers);
            setSecret(secret.value!);
        },
        []
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
            toast.error(t(`${message}Error`, { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    }

    const regenerateClientSecret = async () => {
        const secret = await regenerate<CredentialRepresentation>(
            clientId => adminClient.clients.generateNewClientSecret({ id: clientId }),
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
            clientId =>
                adminClient.clients.generateRegistrationAccessToken({ id: clientId }),
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
                        <SelectControl
                            name="clientAuthenticatorType"
                            label={t("clientAuthenticator")}
                            labelIcon={t("clientAuthenticatorTypeHelp")}
                            controller={{
                                defaultValue: ""
                            }}
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
                                    <code className="block p-2 bg-muted rounded text-sm break-all" id="kc-access-token">
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
