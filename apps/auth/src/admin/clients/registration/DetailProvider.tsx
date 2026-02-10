import ComponentRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentRepresentation";
import ComponentTypeRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentTypeRepresentation";
import { getErrorDescription, getErrorMessage, TextControl, useFetch } from "../../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { Button } from "@merge/ui/components/button";
import { DropdownMenuItem } from "@merge/ui/components/dropdown-menu";
import { useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useAdminClient } from "../../admin-client";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@merge/ui/components/alert-dialog";
import { DynamicComponents } from "../../components/dynamic/DynamicComponents";
import { FormAccess } from "../../components/form/FormAccess";
import { KeycloakSpinner } from "../../../shared/keycloak-ui-shared";
import { ViewHeader } from "../../components/view-header/ViewHeader";
import { useRealm } from "../../context/realm-context/RealmContext";
import { useParams } from "../../utils/useParams";
import {
    RegistrationProviderParams,
    toRegistrationProvider
} from "../routes/AddRegistrationProvider";
import { toClientRegistration } from "../routes/client-registration-path";

export default function DetailProvider() {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const { id, providerId, subTab } = useParams<RegistrationProviderParams>();
    const navigate = useNavigate();
    const form = useForm<ComponentRepresentation>({
        defaultValues: { providerId }
    });
    const { control, handleSubmit, reset } = form;

    const { realm, realmRepresentation } = useRealm();
const [provider, setProvider] = useState<ComponentTypeRepresentation>();

    useFetch(
        async () =>
            await Promise.all([
                adminClient.realms.getClientRegistrationPolicyProviders({ realm }),
                id ? adminClient.components.findOne({ id }) : Promise.resolve()
            ]),
        ([providers, data]) => {
            setProvider(providers.find(p => p.id === providerId));
            reset(data || { providerId });
        },
        []
    );

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
                await adminClient.components.update({ id }, updatedComponent);
            } else {
                const { id } = await adminClient.components.create(updatedComponent);
                navigate(toRegistrationProvider({ id, realm, subTab, providerId }));
            }
            toast.success(t(`provider${id ? "Updated" : "Create"}Success`));
        } catch (error) {
            toast.error(t(`provider${id ? "Updated" : "Create"}Error`, { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const onDeleteConfirm = async () => {
        if (!id) return;
        try {
            await adminClient.components.del({
                realm,
                id
            });
            setDeleteDialogOpen(false);
            toast.success(t("clientRegisterPolicyDeleteSuccess"));
            navigate(toClientRegistration({ realm, subTab }));
        } catch (error) {
            toast.error(t("clientRegisterPolicyDeleteError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    if (!provider) {
        return <KeycloakSpinner />;
    }

    return (
        <>
            <ViewHeader
                titleKey={id ? providerName! : "createPolicy"}
                subKey={id}
                dropdownItems={
                    id
                        ? [
                              <DropdownMenuItem
                                  data-testid="delete"
                                  key="delete"
                                  onClick={() => setDeleteDialogOpen(true)}
                              >
                                  {t("delete")}
                              </DropdownMenuItem>
                          ]
                        : undefined
                }
            />
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("clientRegisterPolicyDeleteConfirmTitle")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("clientRegisterPolicyDeleteConfirm", { name: providerName })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                        <AlertDialogAction variant="destructive" data-testid="confirm" onClick={onDeleteConfirm}>
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
                                    MultivaluedList: { hideLabel: true, helpIconAfterControl: true },
                                    MultivaluedString: { hideLabel: true, helpIconAfterControl: true },
                                    boolean: { booleanLabelTextSwitchHelp: true },
                                }}
                            />
                        <div className="flex gap-2 mt-4">
                            <Button data-testid="save" type="submit">
                                {t("save")}
                            </Button>
                            <Button
                                data-testid="cancel"
                                variant="link"
                                asChild
                            >
                                <Link
                                    to={toClientRegistration({ realm, subTab })}
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
