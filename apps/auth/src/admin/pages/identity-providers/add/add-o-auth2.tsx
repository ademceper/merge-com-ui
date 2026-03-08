import type IdentityProviderRepresentation from "@keycloak/keycloak-admin-client/lib/defs/identityProviderRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Button } from "@merge-rd/ui/components/button";
import { Link, useNavigate } from "@tanstack/react-router";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
    getErrorDescription,
    getErrorMessage
} from "../../../../shared/keycloak-ui-shared";
import { useAdminClient } from "../../../app/admin-client";
import { useRealm } from "../../../app/providers/realm-context/realm-context";
import { FormAccess } from "../../../shared/ui/form/form-access";
import { toIdentityProvider, toIdentityProviders } from "../../../shared/lib/routes/identity-providers";
import { UserProfileClaimsSettings } from "./o-auth2-user-profile-claims-settings";
import { OIDCAuthentication } from "./oidc-authentication";
import { OIDCGeneralSettings } from "./oidc-general-settings";
import { OpenIdConnectSettings } from "./open-id-connect-settings";

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
            navigate({
                to: toIdentityProvider({
                    realm,
                    providerId: id,
                    alias: provider.alias!,
                    tab: "settings"
                }) as string
            });
        } catch (error) {
            toast.error(
                t("createIdentityProviderError", { error: getErrorMessage(error) }),
                { description: getErrorDescription(error) }
            );
        }
    };

    return (
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
                        <Button variant="link" data-testid="cancel" asChild>
                            <Link to={toIdentityProviders({ realm }) as string}>
                                {t("cancel")}
                            </Link>
                        </Button>
                    </div>
                </FormAccess>
            </FormProvider>
        </div>
    );
}
