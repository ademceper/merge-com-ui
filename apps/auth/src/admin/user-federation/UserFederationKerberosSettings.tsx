import type ComponentRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentRepresentation";
import { getErrorDescription, getErrorMessage, useFetch } from "../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { Button } from "@merge/ui/components/button";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAdminClient } from "../admin-client";
import { useRealm } from "../context/realm-context/RealmContext";
import { useParams } from "../utils/useParams";
import { KerberosSettingsRequired } from "./kerberos/KerberosSettingsRequired";
import { toUserFederation } from "./routes/UserFederation";
import { Header } from "./shared/Header";
import { SettingsCache } from "./shared/SettingsCache";

export default function UserFederationKerberosSettings() {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const form = useForm<ComponentRepresentation>({ mode: "onChange" });
    const navigate = useNavigate();
    const { realm } = useRealm();

    const { id } = useParams<{ id?: string }>();
useFetch(
        async () => {
            if (id) {
                return adminClient.components.findOne({ id });
            }
        },
        fetchedComponent => {
            if (fetchedComponent) {
                setupForm(fetchedComponent);
            } else if (id) {
                throw new Error(t("notFound"));
            }
        },
        []
    );

    const setupForm = (component: ComponentRepresentation) => {
        form.reset({ ...component });
    };

    const save = async (component: ComponentRepresentation) => {
        try {
            if (!id) {
                await adminClient.components.create(component);
                navigate(`/${realm}/user-federation`);
            } else {
                await adminClient.components.update({ id }, component);
            }
            setupForm(component as ComponentRepresentation);
            toast.success(t(!id ? "createUserProviderSuccess" : "userProviderSaveSuccess"));
        } catch (error) {
            toast.error(t(!id ? "createUserProviderError" : "userProviderSaveError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    return (
        <FormProvider {...form}>
            <Header provider="Kerberos" save={() => form.handleSubmit(save)()} />
            <div className="p-6">
                <KerberosSettingsRequired form={form} showSectionHeading />
            </div>
            <div className="p-6 flex-1">
                <SettingsCache form={form} showSectionHeading />
                <form onSubmit={form.handleSubmit(save)}>
                    <div className="flex gap-2">
                        <Button
                            disabled={!form.formState.isDirty}
                            type="submit"
                            data-testid="kerberos-save"
                        >
                            {t("save")}
                        </Button>
                        <Button
                            variant="link"
                            onClick={() => navigate(toUserFederation({ realm }))}
                            data-testid="kerberos-cancel"
                        >
                            {t("cancel")}
                        </Button>
                    </div>
                </form>
            </div>
        </FormProvider>
    );
}
