import type ClientRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientRepresentation";
import { Alert, AlertTitle } from "@merge/ui/components/alert";
import { Button } from "@merge/ui/components/button";
import { Label } from "@merge/ui/components/label";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { PasswordInput } from "../../../shared/keycloak-ui-shared";
import { useAdminClient } from "../../admin-client";
import { getErrorDescription, getErrorMessage } from "../../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { useConfirmDialog } from "../../components/confirm-dialog/ConfirmDialog";
import { useAccess } from "../../context/access/Access";
import useFormatDate from "../../utils/useFormatDate";
import { CopyToClipboardButton } from "../../components/copy-to-clipboard-button/CopyToClipboardButton";

export type ClientSecretProps = {
    client: ClientRepresentation;
    secret: string;
    toggle: () => void;
};

type SecretInputProps = ClientSecretProps & {
    id: string;
    buttonLabel: string;
};

const SecretInput = ({ id, buttonLabel, client, secret, toggle }: SecretInputProps) => {
    const { t } = useTranslation();
    const form = useFormContext<ClientRepresentation>();
    const { hasAccess } = useAccess();
    const isManager = hasAccess("manage-clients") || client.access?.configure;

    return (
        <div className="flex gap-2">
            <div className="flex-1">
                <div className="flex">
                    <div className="flex-1">
                        <PasswordInput id={id} value={secret} readOnly />
                    </div>
                    <CopyToClipboardButton
                        id={id}
                        text={secret}
                        label="clientSecret"
                        variant="outline"
                    />
                </div>
            </div>
            <Button
                variant="secondary"
                disabled={form.formState.isDirty || !isManager}
                onClick={toggle}
            >
                {t(buttonLabel)}
            </Button>
        </div>
    );
};

const ExpireDateFormatter = ({ time }: { time: number }) => {
    const { t } = useTranslation();
    const formatDate = useFormatDate();
    const unixTimeToString = (time: number) =>
        time
            ? t("secretExpiresOn", {
                  time: formatDate(new Date(time * 1000), {
                      dateStyle: "full",
                      timeStyle: "long"
                  })
              })
            : undefined;

    return <div className="pf-v5-u-my-md">{unixTimeToString(time)}</div>;
};

export const ClientSecret = ({ client, secret, toggle }: ClientSecretProps) => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
const [secretRotated, setSecretRotated] = useState<string | undefined>(
        client.attributes?.["client.secret.rotated"]
    );
    const secretExpirationTime: number =
        client.attributes?.["client.secret.expiration.time"];
    const secretRotatedExpirationTime: number =
        client.attributes?.["client.secret.rotated.expiration.time"];

    const expired = (time: number) => new Date().getTime() >= time * 1000;

    const [toggleInvalidateConfirm, InvalidateConfirm] = useConfirmDialog({
        titleKey: "invalidateRotatedSecret",
        messageKey: "invalidateRotatedSecretExplain",
        continueButtonLabel: "confirm",
        onConfirm: async () => {
            try {
                await adminClient.clients.invalidateSecret({
                    id: client.id!
                });
                setSecretRotated(undefined);
                toast.success(t("invalidateRotatedSuccess"));
            } catch (error) {
                toast.error(t("invalidateRotatedError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
            }
        }
    });

    useEffect(() => {
        if (secretRotated !== client.attributes?.["client.secret.rotated"]) {
            setSecretRotated(client.attributes?.["client.secret.rotated"]);
        }
    }, [client, secretRotated]);

    return (
        <>
            <InvalidateConfirm />
            <div className="space-y-2 my-4">
                <Label>{t("clientSecret")}</Label>
                <SecretInput
                    id="kc-client-secret"
                    client={client}
                    secret={secret}
                    toggle={toggle}
                    buttonLabel="regenerate"
                />
                <ExpireDateFormatter time={secretExpirationTime} />
                {expired(secretExpirationTime) && (
                    <Alert variant="destructive">
                        <AlertTitle>{t("secretHasExpired")}</AlertTitle>
                    </Alert>
                )}
            </div>
            {secretRotated && (
                <div className="space-y-2">
                    <Label>{t("secretRotated")}</Label>
                    <SecretInput
                        id="secretRotated"
                        client={client}
                        secret={secretRotated}
                        toggle={toggleInvalidateConfirm}
                        buttonLabel="invalidateSecret"
                    />
                    <ExpireDateFormatter time={secretRotatedExpirationTime} />
                </div>
            )}
        </>
    );
};
