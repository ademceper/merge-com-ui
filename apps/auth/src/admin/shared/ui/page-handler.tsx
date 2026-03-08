import type ComponentRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentRepresentation";
import type ComponentTypeRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentTypeRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Button } from "@merge-rd/ui/components/button";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
    getErrorDescription,
    getErrorMessage,
    KeycloakSpinner
} from "../../../shared/keycloak-ui-shared";
import { useRealm } from "../../app/providers/realm-context/realm-context";
import { useHandlerData } from "../../pages/page/hooks/use-handler-data";
import { useSavePageComponent } from "../../pages/page/hooks/use-save-page-component";
import { type PAGE_PROVIDER, TAB_PROVIDER } from "../lib/page-constants";
import { toPage } from "../lib/routes/page";
import { useParams } from "../lib/use-params";
import { DynamicComponents } from "./dynamic/dynamic-components";

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

    const { t } = useTranslation();
    const form = useForm<ComponentTypeRepresentation>();
    const { realm: realmName, realmRepresentation: realm } = useRealm();
    const [id, setId] = useState(idAttribute);
    const params = useParams();

    const [isLoading, setIsLoading] = useState(true);

    const { data: pageHandlerData } = useHandlerData(id, providerType, providerId);
    const { mutateAsync: saveComponentMut } = useSavePageComponent();

    useEffect(() => {
        if (!pageHandlerData) return;
        const { data, tab } = pageHandlerData;
        form.reset(data || tab || {});
        if (tab) setId(tab.id);
        setIsLoading(false);
    }, [pageHandlerData]);

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
            const result = await saveComponentMut({
                id,
                component: updatedComponent
            });
            if (!id && result.id) {
                setId(result.id);
            }
            toast.success(t("itemSaveSuccessful"));
        } catch (error) {
            toast.error(t("itemSaveError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
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
                        <Link
                            to={
                                toPage({
                                    realm: realmName,
                                    providerId: providerId!
                                }) as string
                            }
                        >
                            {t("cancel")}
                        </Link>
                    </Button>
                </div>
            </form>
        </section>
    );
};
