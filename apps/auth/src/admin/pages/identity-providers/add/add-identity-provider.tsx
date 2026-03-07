import type IdentityProviderRepresentation from "@keycloak/keycloak-admin-client/lib/defs/identityProviderRepresentation";
import { Button } from "@merge-rd/ui/components/button";
import { useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useAdminClient } from "../../../app/admin-client";
import { getErrorDescription, getErrorMessage } from "../../../../shared/keycloak-ui-shared";
import { toast } from "sonner";
import { DynamicComponents } from "../../../shared/ui/dynamic/dynamic-components";
import { FormAccess } from "../../../shared/ui/form/form-access";
import { useRealm } from "../../../app/providers/realm-context/realm-context";
import { useServerInfo } from "../../../app/providers/server-info/server-info-provider";
import { toUpperCase } from "../../../shared/lib/util";
import { useParams } from "../../../shared/lib/useParams";
import { toIdentityProvider } from "../routes/identity-provider";
import type { IdentityProviderCreateParams } from "../routes/identity-provider-create";
import { toIdentityProviders } from "../routes/identity-providers";
import { GeneralSettings } from "./general-settings";

export default function AddIdentityProvider() {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const { providerId } = useParams<IdentityProviderCreateParams>();
    const form = useForm<IdentityProviderRepresentation>({ mode: "onChange" });
    const serverInfo = useServerInfo();

    const providerInfo = useMemo(() => {
        const namespaces = [
            "org.keycloak.broker.social.SocialIdentityProvider",
            "org.keycloak.broker.provider.IdentityProvider"
        ];

        for (const namespace of namespaces) {
            const social = serverInfo.componentTypes?.[namespace]?.find(
                ({ id }) => id === providerId
            );

            if (social) {
                return social;
            }
        }
    }, [serverInfo, providerId]);

    const {
        handleSubmit,
        formState: { isValid }
    } = form;
const navigate = useNavigate();
    const { realm } = useRealm();

    const onSubmit = async (provider: IdentityProviderRepresentation) => {
        try {
            await adminClient.identityProviders.create({
                ...provider,
                providerId,
                alias: provider.alias!
            });
            toast.success(t("createIdentityProviderSuccess"));
            navigate(
                toIdentityProvider({
                    realm,
                    providerId,
                    alias: provider.alias!,
                    tab: "settings"
                })
            );
        } catch (error) {
            toast.error(t("createError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    const alias = form.getValues("alias");

    if (!alias) {
        form.setValue("alias", providerId);
    }

    return (
        <>
                        <div className="p-6">
                <FormAccess
                    role="manage-identity-providers"
                    isHorizontal
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <FormProvider {...form}>
                        <GeneralSettings id={providerId} />
                        {providerInfo && (
                            <DynamicComponents
                                stringify
                                properties={providerInfo.properties}
                            />
                        )}
                    </FormProvider>
                    <div className="flex gap-2">
                        <Button
                            disabled={!isValid}
                            type="submit"
                            data-testid="createProvider"
                        >
                            {t("add")}
                        </Button>
                        <Button
                            variant="link"
                            data-testid="cancel"
                            asChild
                        >
                            <Link to={toIdentityProviders({ realm })}>
                                {t("cancel")}
                            </Link>
                        </Button>
                    </div>
                </FormAccess>
            </div>
        </>
    );
}
