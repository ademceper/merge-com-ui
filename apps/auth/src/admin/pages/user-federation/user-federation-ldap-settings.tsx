import type ComponentRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
    getErrorDescription,
    getErrorMessage,
    KeycloakSpinner
} from "../../../shared/keycloak-ui-shared";
import { useRealm } from "../../app/providers/realm-context/realm-context";
import type { UserFederationLdapParams } from "../../shared/lib/routes/user-federation";
import { toUserFederationLdapMapper } from "../../shared/lib/routes/user-federation";
import { useParams } from "../../shared/lib/use-params";
import { useComponentDetail } from "./hooks/use-component-detail";
import { useUpdateComponent } from "./hooks/use-update-component";
import { LdapMapperList } from "./ldap/mappers/ldap-mapper-list";
import { ExtendedHeader } from "./shared/extended-header";
import {
    type LdapComponentRepresentation,
    serializeFormData,
    UserFederationLdapForm
} from "./user-federation-ldap-form";

export function UserFederationLdapSettings() {

    const { t } = useTranslation();
    const form = useForm<LdapComponentRepresentation>({ mode: "onChange" });
    const { realm } = useRealm();
    const { id, tab } = useParams<UserFederationLdapParams & { tab?: string }>();

    const { data: component, refetch: refetchComponent } = useComponentDetail(id);
    const { mutateAsync: updateComponentMut } = useUpdateComponent();

    useEffect(() => {
        if (component) {
            setupForm(component);
        }
    }, [component]);

    const refresh = () => {
        refetchComponent();
    };

    const setupForm = (component: ComponentRepresentation) => {
        form.reset({});
        form.reset(component);
        form.setValue(
            "config.periodicChangedUsersSync",
            component.config?.changedSyncPeriod?.[0] !== "-1"
        );

        form.setValue(
            "config.periodicFullSync",
            component.config?.fullSyncPeriod?.[0] !== "-1"
        );
    };

    const onSubmit = async (formData: LdapComponentRepresentation) => {
        try {
            await updateComponentMut({ id: id!, component: serializeFormData(formData) });
            toast.success(t("userProviderSaveSuccess"));
            refresh();
        } catch (error) {
            toast.error(t("userProviderSaveError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        }
    };

    if (!component) {
        return <KeycloakSpinner />;
    }

    const renderContent = () => {
        switch (tab) {
            case "mappers":
                return (
                    <LdapMapperList
                        toCreate={toUserFederationLdapMapper({
                            realm,
                            id: id!,
                            mapperId: "new"
                        })}
                        toDetail={mapperId =>
                            toUserFederationLdapMapper({
                                realm,
                                id: id!,
                                mapperId
                            })
                        }
                    />
                );
            default:
                return (
                    <div className="p-6">
                        <UserFederationLdapForm id={id} onSubmit={onSubmit} />
                    </div>
                );
        }
    };

    return (
        <FormProvider {...form}>
            <ExtendedHeader
                provider="LDAP"
                noDivider
                editMode={component.config?.editMode}
                save={() => form.handleSubmit(onSubmit)()}
            />
            <div className="p-0">
                <div className="bg-muted/30">{renderContent()}</div>
            </div>
        </FormProvider>
    );
}
