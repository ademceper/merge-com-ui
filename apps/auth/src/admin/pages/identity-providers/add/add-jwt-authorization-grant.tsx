import type IdentityProviderRepresentation from "@keycloak/keycloak-admin-client/lib/defs/identityProviderRepresentation";
import { Button } from "@merge-rd/ui/components/button";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useAdminClient } from "../../../app/admin-client";
import { getErrorDescription, getErrorMessage } from "../../../../shared/keycloak-ui-shared";
import { toast } from "sonner";
import { FormAccess } from "../../../shared/ui/form/form-access";
import { useRealm } from "../../../app/providers/realm-context/realm-context";
import { toIdentityProvider } from "../routes/identity-provider";
import { toIdentityProviders } from "../routes/identity-providers";
import JWTAuthorizationGrantSettings from "./jwt-authorization-grant-settings";
type DiscoveryIdentityProvider = IdentityProviderRepresentation & {
    discoveryEndpoint?: string;
};

export default function AddJWTAuthorizationGrantConnect() {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const navigate = useNavigate();
    const id = "jwt-authorization-grant";

    const form = useForm<DiscoveryIdentityProvider>({
        defaultValues: { alias: id, config: { allowCreate: "true" } },
        mode: "onChange"
    });
    const {
        handleSubmit,
        formState: { isDirty }
    } = form;
const { realm } = useRealm();

    const onSubmit = async (provider: DiscoveryIdentityProvider) => {
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
        } catch (error: any) {
            toast.error(t("createIdentityProviderError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    return (
        <>
                        <div className="p-6">
                <FormProvider {...form}>
                    <FormAccess
                        role="manage-identity-providers"
                        isHorizontal
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        <JWTAuthorizationGrantSettings />

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
