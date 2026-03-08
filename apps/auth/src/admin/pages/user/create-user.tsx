import type GroupRepresentation from "@keycloak/keycloak-admin-client/lib/defs/groupRepresentation";
import { type TFunction, useTranslation } from "@merge-rd/i18n";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
    getErrorDescription,
    getErrorMessage,
    isUserProfileError,
    KeycloakSpinner,
    setUserProfileServerError
} from "../../../shared/keycloak-ui-shared";
import { useRealm } from "../../app/providers/realm-context/realm-context";
import { toUser } from "../../shared/lib/routes/user";
import { useCreateUser } from "./hooks/use-create-user";
import { useUserProfileMetadata } from "./hooks/use-user-profile-metadata";
import { toUserRepresentation, type UserFormFields } from "./form-state";
import { UserForm } from "./user-form";

export function CreateUser() {

    const { t } = useTranslation();
    const navigate = useNavigate();
    const { realm: realmName, realmRepresentation: realm } = useRealm();
    const form = useForm<UserFormFields>({ mode: "onChange" });
    const [addedGroups, setAddedGroups] = useState<GroupRepresentation[]>([]);
    const { data: userProfileMetadata } = useUserProfileMetadata(realmName);
    const { mutateAsync: createUserMut } = useCreateUser();

    const save = async (data: UserFormFields) => {
        try {
            const createdUser = await createUserMut({
                ...toUserRepresentation(data),
                groups: addedGroups.map(group => group.path!),
                enabled: true
            });

            toast.success(t("userCreated"));
            navigate({
                to: toUser({
                    id: createdUser.id,
                    realm: realmName,
                    tab: "settings"
                }) as string
            });
        } catch (error) {
            if (isUserProfileError(error)) {
                setUserProfileServerError(error, form.setError, ((key, param) =>
                    t(key as string, param as any)) as TFunction);
            } else {
                toast.error(t("userCreateError", { error: getErrorMessage(error) }), {
                    description: getErrorDescription(error)
                });
            }
        }
    };

    if (!realm || !userProfileMetadata) {
        return <KeycloakSpinner />;
    }

    return (
        <div className="bg-muted/30 p-4">
            <UserForm
                form={form}
                realm={realm}
                userProfileMetadata={userProfileMetadata}
                onGroupsUpdate={setAddedGroups}
                save={save}
            />
        </div>
    );
}
