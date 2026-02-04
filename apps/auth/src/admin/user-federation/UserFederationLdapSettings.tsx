import type ComponentRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentRepresentation";
import { getErrorDescription, getErrorMessage, KeycloakSpinner, useFetch } from "../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useAdminClient } from "../admin-client";
import { useRealm } from "../context/realm-context/RealmContext";
import {
    LdapComponentRepresentation,
    UserFederationLdapForm,
    serializeFormData
} from "./UserFederationLdapForm";
import { LdapMapperList } from "./ldap/mappers/LdapMapperList";
import { UserFederationLdapParams } from "./routes/UserFederationLdap";
import { toUserFederationLdapMapper } from "./routes/UserFederationLdapMapper";
import { ExtendedHeader } from "./shared/ExtendedHeader";

export default function UserFederationLdapSettings() {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const form = useForm<LdapComponentRepresentation>({ mode: "onChange" });
    const { realm } = useRealm();
    const { id, tab } = useParams<UserFederationLdapParams & { tab?: string }>();
const [component, setComponent] = useState<ComponentRepresentation>();
    const [refreshCount, setRefreshCount] = useState(0);

    const refresh = () => setRefreshCount(count => count + 1);

    useFetch(
        () => adminClient.components.findOne({ id: id! }),
        component => {
            if (!component) {
                throw new Error(t("notFound"));
            }

            setComponent(component);
            setupForm(component);
        },
        [id, refreshCount]
    );

    const setupForm = (component: ComponentRepresentation) => {
        form.reset({});
        form.reset(component);
        form.setValue(
            "config.periodicChangedUsersSync",
            component.config?.["changedSyncPeriod"]?.[0] !== "-1"
        );

        form.setValue(
            "config.periodicFullSync",
            component.config?.["fullSyncPeriod"]?.[0] !== "-1"
        );
    };

    const onSubmit = async (formData: LdapComponentRepresentation) => {
        try {
            await adminClient.components.update({ id: id! }, serializeFormData(formData));
            toast.success(t("userProviderSaveSuccess"));
            refresh();
        } catch (error) {
            toast.error(t("userProviderSaveError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
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
                <div className="bg-muted/30">
                    {renderContent()}
                </div>
            </div>
        </FormProvider>
    );
}
