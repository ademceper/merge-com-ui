import type IdentityProviderRepresentation from "@keycloak/keycloak-admin-client/lib/defs/identityProviderRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Button } from "@merge-rd/ui/components/button";
import { Link, useNavigate } from "@tanstack/react-router";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
    getErrorDescription,
    getErrorMessage
} from "@/shared/keycloak-ui-shared";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import {
    toIdentityProvider,
    toIdentityProviders
} from "@/admin/shared/lib/routes/identity-providers";
import { FormAccess } from "@/admin/shared/ui/form/form-access";
import { useCreateIdentityProvider } from "../hooks/use-create-identity-provider";
import { SpiffeSettings } from "./spiffe-settings";

type DiscoveryIdentityProvider = IdentityProviderRepresentation & {
    discoveryEndpoint?: string;
};

export function AddSamlConnect() {

    const { t } = useTranslation();
    const navigate = useNavigate();
    const id = "spiffe";

    const form = useForm<DiscoveryIdentityProvider>({
        defaultValues: { alias: id, config: { allowCreate: "true" } },
        mode: "onChange"
    });
    const {
        handleSubmit,
        formState: { isDirty }
    } = form;
    const { realm } = useRealm();
    const { mutateAsync: createIdp } = useCreateIdentityProvider();

    const onSubmit = async (provider: DiscoveryIdentityProvider) => {
        delete provider.discoveryEndpoint;
        try {
            await createIdp({
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
        } catch (error: any) {
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
                    <SpiffeSettings />
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
