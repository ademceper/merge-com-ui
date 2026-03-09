import type ComponentRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentRepresentation";
import type ComponentTypeRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentTypeRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@merge-rd/ui/components/alert-dialog";
import { Button, buttonVariants } from "@merge-rd/ui/components/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@merge-rd/ui/components/dropdown-menu";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import {
    getErrorDescription,
    getErrorMessage,
    KeycloakSpinner,
    TextControl
} from "@/shared/keycloak-ui-shared";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import { useCreateComponent, useUpdateComponent, useDeleteComponent } from "../hooks/use-component-operations";
import {
    type RegistrationProviderParams,
    toClientRegistration,
    toRegistrationProvider
} from "@/admin/shared/lib/routes/clients";
import { useParams } from "@/admin/shared/lib/use-params";
import { DynamicComponents } from "@/admin/shared/ui/dynamic/dynamic-components";
import { FormAccess } from "@/admin/shared/ui/form/form-access";
import { useRegistrationProvider } from "../hooks/use-registration-provider";

export function DetailProvider() {

    const { t } = useTranslation();
    const { id, providerId, subTab } = useParams<RegistrationProviderParams>();
    const navigate = useNavigate();
    const { mutateAsync: createComponentMutation } = useCreateComponent();
    const { mutateAsync: updateComponentMutation } = useUpdateComponent();
    const { mutateAsync: deleteComponentMutation } = useDeleteComponent();
    const form = useForm<ComponentRepresentation>({
        defaultValues: { providerId }
    });
    const { control, handleSubmit, reset } = form;

    const { realm, realmRepresentation } = useRealm();
    const [provider, setProvider] = useState<ComponentTypeRepresentation>();

    const { data: registrationData } = useRegistrationProvider(providerId, id);

    useEffect(() => {
        if (registrationData) {
            setProvider(registrationData.provider);
            reset(registrationData.data || { providerId });
        }
    }, [registrationData]);

    const providerName = useWatch({ control, defaultValue: "", name: "name" });

    const onSubmit = async (component: ComponentRepresentation) => {
        if (component.config)
            Object.entries(component.config).forEach(
                ([key, value]) =>
                    (component.config![key] = Array.isArray(value) ? value : [value])
            );
        try {
            const updatedComponent = {
                ...component,
                subType: subTab,
                parentId: realmRepresentation?.id,
                providerType:
                    "org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy",
                providerId
            };
            if (id) {
                await updateComponentMutation({ id, component: updatedComponent });
            } else {
                const { id } = await createComponentMutation(updatedComponent);
                navigate({
                    to: toRegistrationProvider({
                        id,
                        realm,
                        subTab,
                        providerId
                    }) as string
                });
            }
            toast.success(t(`provider${id ? "Updated" : "Create"}Success`));
        } catch (error) {
            toast.error(
                t(`provider${id ? "Updated" : "Create"}Error`, {
                    error: getErrorMessage(error)
                }),
                { description: getErrorDescription(error) }
            );
        }
    };

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const onDeleteConfirm = async () => {
        if (!id) return;
        try {
            await deleteComponentMutation(id);
            setDeleteDialogOpen(false);
            toast.success(t("clientRegisterPolicyDeleteSuccess"));
            navigate({ to: toClientRegistration({ realm, subTab }) as string });
        } catch (error) {
            toast.error(
                t("clientRegisterPolicyDeleteError", { error: getErrorMessage(error) }),
                { description: getErrorDescription(error) }
            );
        }
    };

    if (!provider) {
        return <KeycloakSpinner />;
    }

    return (
        <>
            {id && (
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2" />
                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                data-testid="action-dropdown"
                                className={buttonVariants()}
                            >
                                {t("action")}
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                    data-testid="delete"
                                    key="delete"
                                    onClick={() => setDeleteDialogOpen(true)}
                                >
                                    {t("delete")}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            )}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {t("clientRegisterPolicyDeleteConfirmTitle")}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("clientRegisterPolicyDeleteConfirm", {
                                name: providerName
                            })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            data-testid="confirm"
                            onClick={onDeleteConfirm}
                        >
                            {t("delete")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <div className="p-6">
                <FormProvider {...form}>
                    <FormAccess
                        role="manage-clients"
                        isHorizontal
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        <TextControl name="providerId" label={t("provider")} readOnly />
                        <TextControl
                            name="name"
                            label={t("name")}
                            labelIcon={t("clientPolicyNameHelp")}
                            rules={{ required: t("required") }}
                        />
                        <DynamicComponents
                            properties={provider.properties}
                            layoutOverridesByType={{
                                List: { hideLabel: true, helpIconAfterControl: true },
                                MultivaluedList: {
                                    hideLabel: true,
                                    helpIconAfterControl: true
                                },
                                MultivaluedString: {
                                    hideLabel: true,
                                    helpIconAfterControl: true
                                },
                                boolean: { booleanLabelTextSwitchHelp: true }
                            }}
                        />
                        <div className="flex gap-2 mt-4">
                            <Button data-testid="save" type="submit">
                                {t("save")}
                            </Button>
                            <Button data-testid="cancel" variant="link" asChild>
                                <Link
                                    to={toClientRegistration({ realm, subTab }) as string}
                                >
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
