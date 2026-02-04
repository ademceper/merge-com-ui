import type ClientRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientRepresentation";
import { getErrorDescription, getErrorMessage, useFetch } from "../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useAdminClient } from "../admin-client";
import { AuthorizationPolicies } from "../clients/authorization/Policies";
import { FormFields, SaveOptions } from "../clients/ClientDetails";
import { ConfirmDialogModal } from "../components/confirm-dialog/ConfirmDialog";
import { ViewHeader } from "../components/view-header/ViewHeader";
import { useAccess } from "../context/access/Access";
import { useRealm } from "../context/realm-context/RealmContext";
import { convertFormValuesToObject, convertToFormValues } from "../util";
import useToggle from "../utils/useToggle";
import { PermissionsConfigurationTab } from "./permission-configuration/PermissionsConfigurationTab";
import { PermissionsEvaluationTab } from "./permission-evaluation/PermissionsEvaluationTab";

export default function PermissionsConfigurationSection() {
    const { adminClient } = useAdminClient();
    const { t } = useTranslation();
    const { hasAccess } = useAccess();
const { tab } = useParams<{ tab?: string }>();
    const [adminPermissionsClient, setAdminPermissionsClient] = useState<
        ClientRepresentation | undefined
    >();
    const [changeAuthenticatorOpen, toggleChangeAuthenticatorOpen] = useToggle();
    const form = useForm<FormFields>();
    useRealm();

    const clientAuthenticatorType = useWatch({
        control: form.control,
        name: "clientAuthenticatorType",
        defaultValue: "client-secret"
    });

    const hasManageAuthorization = hasAccess("manage-authorization");
    const hasViewUsers = hasAccess("view-users");

    useFetch(
        async () => {
            const clients = await adminClient.clients.find({
                clientId: "admin-permissions"
            });
            return clients[0];
        },
        adminPermissionsClient => {
            setAdminPermissionsClient(adminPermissionsClient!);
        },
        []
    );

    const setupForm = (client: ClientRepresentation) => {
        form.reset({ ...client });
        convertToFormValues(client, form.setValue);
    };

    const save = async (
        { confirmed = false, messageKey = "clientSaveSuccess" }: SaveOptions = {
            confirmed: false,
            messageKey: "clientSaveSuccess"
        }
    ) => {
        if (!(await form.trigger())) {
            return;
        }

        if (
            !adminPermissionsClient?.publicClient &&
            adminPermissionsClient?.clientAuthenticatorType !== clientAuthenticatorType &&
            !confirmed
        ) {
            toggleChangeAuthenticatorOpen();
            return;
        }

        const values = convertFormValuesToObject(form.getValues());

        const submittedClient = convertFormValuesToObject<ClientRepresentation>(values);

        try {
            const newClient: ClientRepresentation = {
                ...adminPermissionsClient,
                ...submittedClient
            };

            newClient.clientId = newClient.clientId?.trim();

            await adminClient.clients.update(
                { id: adminPermissionsClient!.clientId! },
                newClient
            );
            setupForm(newClient);
            setAdminPermissionsClient(newClient);
            toast.success(t(messageKey));
        } catch (error) {
            toast.error(t("clientSaveError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    const renderContent = () => {
        if (!adminPermissionsClient) return null;

        switch (tab) {
            case "policies":
                return (
                    <AuthorizationPolicies
                        clientId={adminPermissionsClient.id!}
                        isDisabled={!hasManageAuthorization}
                    />
                );
            case "evaluation":
                return hasViewUsers ? (
                    <PermissionsEvaluationTab
                        client={adminPermissionsClient}
                        save={save}
                    />
                ) : null;
            default:
                return (
                    <PermissionsConfigurationTab
                        clientId={adminPermissionsClient.id!}
                    />
                );
        }
    };

    return (
        adminPermissionsClient && (
            <>
                <ConfirmDialogModal
                    continueButtonLabel="yes"
                    cancelButtonLabel="no"
                    titleKey={t("changeAuthenticatorConfirmTitle", {
                        clientAuthenticatorType: clientAuthenticatorType
                    })}
                    open={changeAuthenticatorOpen}
                    toggleDialog={toggleChangeAuthenticatorOpen}
                    onConfirm={() => save({ confirmed: true })}
                >
                    <>
                        {t("changeAuthenticatorConfirm", {
                            clientAuthenticatorType: clientAuthenticatorType
                        })}
                    </>
                </ConfirmDialogModal>
                <div className="p-0">
                    <FormProvider {...form}>
                        <ViewHeader
                            titleKey={t("permissions")}
                            subKey={t("permissionsSubTitle")}
                        />
                        <div className="bg-muted/30">
                            {renderContent()}
                        </div>
                    </FormProvider>
                </div>
            </>
        )
    );
}
