import type { UserProfileConfig } from "@keycloak/keycloak-admin-client/lib/defs/userProfileMetadata";
import { useTranslation } from "@merge-rd/i18n";
import { useQueryClient } from "@tanstack/react-query";
import { type PropsWithChildren, useState } from "react";
import { toast } from "sonner";
import {
    createNamedContext,
    getErrorDescription,
    getErrorMessage,
    useRequiredContext
} from "../../../../shared/keycloak-ui-shared";
import { useAdminClient } from "../../../app/admin-client";
import { useRealm } from "../../../app/providers/realm-context/realm-context";
import { realmSettingsKeys } from "../api/keys";
import { useUserProfileConfig } from "../api/use-user-profile-config";

type UserProfileProps = {
    config: UserProfileConfig | null;
    save: SaveCallback;
    isSaving: boolean;
};

type SaveCallback = (
    updatedConfig: UserProfileConfig,
    options?: SaveOptions
) => Promise<boolean>;

type SaveOptions = {
    successMessageKey?: string;
    errorMessageKey?: string;
};

const UserProfileContext = createNamedContext<UserProfileProps | undefined>(
    "UserProfileContext",
    undefined
);

export const UserProfileProvider = ({ children }: PropsWithChildren) => {
    const { adminClient } = useAdminClient();

    const { realm } = useRealm();
    const { t } = useTranslation();
    const [isSaving, setIsSaving] = useState(false);
    const queryClient = useQueryClient();

    const { data: config = null } = useUserProfileConfig();

    const save: SaveCallback = async (updatedConfig, options) => {
        setIsSaving(true);

        try {
            await adminClient.users.updateProfile({
                ...updatedConfig,
                realm
            });

            setIsSaving(false);
            queryClient.invalidateQueries({
                queryKey: realmSettingsKeys.userProfile(realm)
            });
            toast.success(t(options?.successMessageKey ?? "userProfileSuccess"));

            return true;
        } catch (error) {
            setIsSaving(false);
            toast.error(
                t(options?.errorMessageKey ?? "userProfileError", {
                    error: getErrorMessage(error)
                }),
                { description: getErrorDescription(error) }
            );

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
