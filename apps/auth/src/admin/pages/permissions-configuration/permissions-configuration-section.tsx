import type ClientRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { useQueryClient } from "@tanstack/react-query";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { getErrorDescription, getErrorMessage } from "../../../shared/keycloak-ui-shared";
import { useAdminClient } from "../../app/admin-client";
import { useAccess } from "../../app/providers/access/access";
import { useRealm } from "../../app/providers/realm-context/realm-context";
import { useParams } from "../../shared/lib/useParams";
import useToggle from "../../shared/lib/useToggle";
import { convertFormValuesToObject, convertToFormValues } from "../../shared/lib/util";
import { ConfirmDialogModal } from "../../shared/ui/confirm-dialog/confirm-dialog";
import { AuthorizationPolicies } from "../clients/authorization/policies";
import type { FormFields, SaveOptions } from "../clients/client-details";
import { permissionsKeys } from "./api/keys";
import { useAdminPermissionsClient } from "./api/use-admin-permissions-client";
import { PermissionsConfigurationTab } from "./permission-configuration/permissions-configuration-tab";
import { PermissionsEvaluationTab } from "./permission-evaluation/permissions-evaluation-tab";

export default function PermissionsConfigurationSection() {
    const { adminClient } = useAdminClient();
    const { t } = useTranslation();
    const { hasAccess } = useAccess();
    const { tab } = useParams<{ tab?: string }>();
    const queryClient = useQueryClient();
    const { data: adminPermissionsClient } = useAdminPermissionsClient();
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
            await queryClient.invalidateQueries({ queryKey: permissionsKeys.adminPermissionsClient() });
            toast.success(t(messageKey));
        } catch (error) {
            toast.error(t("clientSaveError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
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
                    <PermissionsConfigurationTab clientId={adminPermissionsClient.id!} />
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
                    {t("changeAuthenticatorConfirm", {
                        clientAuthenticatorType: clientAuthenticatorType
                    })}
                </ConfirmDialogModal>
                <div className="p-0">
                    <FormProvider {...form}>
                        <div className="bg-muted/30">{renderContent()}</div>
                    </FormProvider>
                </div>
            </>
        )
    );
}
