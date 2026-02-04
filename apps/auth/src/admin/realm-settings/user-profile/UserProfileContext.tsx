import type { UserProfileConfig } from "@keycloak/keycloak-admin-client/lib/defs/userProfileMetadata";
import { getErrorDescription, getErrorMessage, createNamedContext,
    useFetch,
    useRequiredContext } from "../../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { PropsWithChildren, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../../admin-client";
import { useRealm } from "../../context/realm-context/RealmContext";

type UserProfileProps = {
    config: UserProfileConfig | null;
    save: SaveCallback;
    isSaving: boolean;
};

export type SaveCallback = (
    updatedConfig: UserProfileConfig,
    options?: SaveOptions
) => Promise<boolean>;

export type SaveOptions = {
    successMessageKey?: string;
    errorMessageKey?: string;
};

export const UserProfileContext = createNamedContext<UserProfileProps | undefined>(
    "UserProfileContext",
    undefined
);

export const UserProfileProvider = ({ children }: PropsWithChildren) => {
    const { adminClient } = useAdminClient();

    const { realm } = useRealm();
const { t } = useTranslation();
    const [config, setConfig] = useState<UserProfileConfig | null>(null);
    const [refreshCount, setRefreshCount] = useState(0);
    const [isSaving, setIsSaving] = useState(false);

    useFetch(
        () => adminClient.users.getProfile({ realm }),
        config => setConfig(config),
        [refreshCount]
    );

    const save: SaveCallback = async (updatedConfig, options) => {
        setIsSaving(true);

        try {
            await adminClient.users.updateProfile({
                ...updatedConfig,
                realm
            });

            setIsSaving(false);
            setRefreshCount(refreshCount + 1);
            toast.success(t(options?.successMessageKey ?? "userProfileSuccess"));

            return true;
        } catch (error) {
            setIsSaving(false);
            toast.error(t(options?.errorMessageKey ?? "userProfileError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });

            return false;
        }
    };

    return (
        <UserProfileContext.Provider value={{ config, save, isSaving }}>
            {children}
        </UserProfileContext.Provider>
    );
};

export const useUserProfile = () => useRequiredContext(UserProfileContext);
