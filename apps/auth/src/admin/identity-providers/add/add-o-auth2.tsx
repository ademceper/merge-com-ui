import type IdentityProviderRepresentation from "@keycloak/keycloak-admin-client/lib/defs/identityProviderRepresentation";
import { Button } from "@merge-rd/ui/components/button";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useAdminClient } from "../../admin-client";
import { getErrorDescription, getErrorMessage } from "../../../shared/keycloak-ui-shared";
import { toast } from "sonner";
import { FormAccess } from "../../components/form/form-access";
import { ViewHeader } from "../../components/view-header/view-header";
import { useRealm } from "../../context/realm-context/realm-context";
import { toIdentityProvider } from "../routes/identity-provider";
import { toIdentityProviders } from "../routes/identity-providers";
import { OIDCAuthentication } from "./oidc-authentication";
import { OIDCGeneralSettings } from "./oidc-general-settings";
import { OpenIdConnectSettings } from "./open-id-connect-settings";
import { UserProfileClaimsSettings } from "./o-auth2-user-profile-claims-settings";

type DiscoveryIdentity = IdentityProviderRepresentation & {
    discoveryEndpoint?: string;
};

export default function AddOpenIdConnect() {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const navigate = useNavigate();
    const id = `oauth2`;

    const form = useForm<IdentityProviderRepresentation>({
        defaultValues: { alias: id },
        mode: "onChange"
    });
    const {
        handleSubmit,
        formState: { isDirty }
    } = form;
const { realm } = useRealm();

    const onSubmit = async (provider: DiscoveryIdentity) => {
        delete provider.discoveryEndpoint;
        try {
            await adminClient.identityProviders.create({
                ...provider,
                providerId: id
            });
            toast.success(t("createIdentityProviderSuccess"));
            navigate(
                toIdentityProvider({
                    realm,
                    providerId: id,
                    alias: provider.alias!,
                    tab: "settings"
                })
            );
        } catch (error) {
            toast.error(t("createIdentityProviderError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    return (
        <>
            <ViewHeader titleKey={t("addOAuth2Provider")} />
            <div className="p-6">
                <FormProvider {...form}>
                    <FormAccess
                        role="manage-identity-providers"
                        isHorizontal
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        <OIDCGeneralSettings />
                        <OpenIdConnectSettings isOIDC={false} />
                        <OIDCAuthentication />
                        <UserProfileClaimsSettings />
                        <div className="flex gap-2">
                            <Button
                                disabled={!isDirty}
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
                </FormProvider>
            </div>
        </>
    );
}
