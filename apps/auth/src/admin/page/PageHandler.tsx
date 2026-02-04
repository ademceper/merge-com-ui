import ComponentRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentRepresentation";
import ComponentTypeRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentTypeRepresentation";
import { getErrorDescription, getErrorMessage, KeycloakSpinner, useFetch } from "../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { Button } from "@merge/ui/components/button";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAdminClient } from "../admin-client";
import { DynamicComponents } from "../components/dynamic/DynamicComponents";
import { useRealm } from "../context/realm-context/RealmContext";
import { useParams } from "../utils/useParams";
import { type PAGE_PROVIDER, TAB_PROVIDER } from "./constants";
import { toPage } from "./routes";

type PageHandlerProps = {
    id?: string;
    providerType: typeof TAB_PROVIDER | typeof PAGE_PROVIDER;
    page: ComponentTypeRepresentation;
};

export const PageHandler = ({
    id: idAttribute,
    providerType,
    page: { id: providerId, ...page }
}: PageHandlerProps) => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const form = useForm<ComponentTypeRepresentation>();
    const { realm: realmName, realmRepresentation: realm } = useRealm();
const [id, setId] = useState(idAttribute);
    const params = useParams();

    const [isLoading, setIsLoading] = useState(true);

    useFetch(
        async () =>
            await Promise.all([
                id ? adminClient.components.findOne({ id }) : Promise.resolve(),
                providerType === TAB_PROVIDER
                    ? adminClient.components.find({ type: TAB_PROVIDER })
                    : Promise.resolve()
            ]),
        ([data, tabs]) => {
            const tab = (tabs || []).find(t => t.providerId === providerId);
            form.reset(data || tab || {});
            if (tab) setId(tab.id);
            setIsLoading(false);
        },
        []
    );

    const onSubmit = async (component: ComponentRepresentation) => {
        if (component.config || params) {
            component.config = Object.assign(component.config || {}, params);
            Object.entries(component.config).forEach(
                ([key, value]) =>
                    (component.config![key] = Array.isArray(value) ? value : [value])
            );
        }
        try {
            const updatedComponent = {
                ...component,
                providerId,
                providerType,
                parentId: realm?.id
            };
            if (id) {
                await adminClient.components.update({ id }, updatedComponent);
            } else {
                const { id } = await adminClient.components.create(updatedComponent);
                setId(id);
            }
            toast.success(t("itemSaveSuccessful"));
        } catch (error) {
            toast.error(t("itemSaveError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    if (isLoading) {
        return <KeycloakSpinner />;
    }

    return (
        <section className="py-6 bg-muted/30">
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="keycloak__form space-y-4"
            >
                <FormProvider {...form}>
                    <DynamicComponents properties={page.properties} />
                </FormProvider>

                <div className="flex gap-2">
                    <Button data-testid="save" type="submit">
                        {t("save")}
                    </Button>
                    <Button variant="ghost" asChild>
                        <Link to={toPage({ realm: realmName, providerId: providerId! })}>
                            {t("cancel")}
                        </Link>
                    </Button>
                </div>
            </form>
        </section>
    );
};
