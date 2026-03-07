import type GroupRepresentation from "@keycloak/keycloak-admin-client/lib/defs/groupRepresentation";
import type { UserProfileMetadata } from "@keycloak/keycloak-admin-client/lib/defs/userProfileMetadata";
import { getErrorDescription, getErrorMessage, isUserProfileError,
    setUserProfileServerError,
    useFetch } from "../../../shared/keycloak-ui-shared";
import { toast } from "sonner";
import { TFunction } from "@merge-rd/i18n";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "@merge-rd/i18n";
import { useNavigate } from "@tanstack/react-router";
import { useAdminClient } from "../../app/admin-client";
import { KeycloakSpinner } from "../../../shared/keycloak-ui-shared";
import { useRealm } from "../../app/providers/realm-context/realm-context";
import { UserForm } from "./user-form";
import { UserFormFields, toUserRepresentation } from "./form-state";
import { toUser } from "./routes/user";

export default function CreateUser() {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
const navigate = useNavigate();
    const { realm: realmName, realmRepresentation: realm } = useRealm();
    const form = useForm<UserFormFields>({ mode: "onChange" });
    const [addedGroups, setAddedGroups] = useState<GroupRepresentation[]>([]);
    const [userProfileMetadata, setUserProfileMetadata] = useState<UserProfileMetadata>();

    useFetch(
        () => adminClient.users.getProfileMetadata({ realm: realmName }),
        userProfileMetadata => {
            if (!userProfileMetadata) {
                throw new Error(t("notFound"));
            }

            setUserProfileMetadata(userProfileMetadata);
        },
        []
    );

    const save = async (data: UserFormFields) => {
        try {
            const createdUser = await adminClient.users.create({
                ...toUserRepresentation(data),
                groups: addedGroups.map(group => group.path!),
                enabled: true
            });

            toast.success(t("userCreated"));
            navigate({ to: toUser({ id: createdUser.id, realm: realmName, tab: "settings" }) as string });
        } catch (error) {
            if (isUserProfileError(error)) {
                setUserProfileServerError(error, form.setError, ((key, param) =>
                    t(key as string, param as any)) as TFunction);
            } else {
                toast.error(t("userCreateError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
            }
        }
    };

    if (!realm || !userProfileMetadata) {
        return <KeycloakSpinner />;
    }

    return (
        <>
                        <div className="bg-muted/30 p-4">
                <UserForm
                    form={form}
                    realm={realm}
                    userProfileMetadata={userProfileMetadata}
                    onGroupsUpdate={setAddedGroups}
                    save={save}
                />
            </div>
        </>
    );
}
