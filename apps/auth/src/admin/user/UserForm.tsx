/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/user/UserForm.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import type GroupRepresentation from "@keycloak/keycloak-admin-client/lib/defs/groupRepresentation";
import type RealmRepresentation from "@keycloak/keycloak-admin-client/lib/defs/realmRepresentation";
import {
    UserProfileAttributeMetadata,
    UserProfileMetadata
} from "@keycloak/keycloak-admin-client/lib/defs/userProfileMetadata";
import type UserRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userRepresentation";
import {
    FormErrorText,
    HelpItem,
    SwitchControl,
    TextControl,
    UserProfileFields,
    ContinueCancelModal
} from "../../shared/keycloak-ui-shared";
import { Alert, AlertDescription } from "@merge/ui/components/alert";
import { AlertVariant } from "../../shared/keycloak-ui-shared";
import { Button } from "@merge/ui/components/button";
import { Badge } from "@merge/ui/components/badge";
import { Input } from "@merge/ui/components/input";
import { Label } from "@merge/ui/components/label";
import { Switch } from "@merge/ui/components/switch";
import { X } from "@phosphor-icons/react";
import { TFunction } from "i18next";
import { useEffect, useState } from "react";
import { Controller, FormProvider, UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../admin-client";
import { DefaultSwitchControl } from "../components/SwitchControl";
import { useAlerts } from "../../shared/keycloak-ui-shared";
import { FormAccess } from "../components/form/FormAccess";
import { GroupPickerDialog } from "../components/group/GroupPickerDialog";
import { useAccess } from "../context/access/Access";
import { useWhoAmI } from "../context/whoami/WhoAmI";
import { emailRegexPattern } from "../util";
import useFormatDate from "../utils/useFormatDate";
import { FederatedUserLink } from "./FederatedUserLink";
import { UserFormFields, toUserFormFields } from "./form-state";
import { toUsers } from "./routes/Users";
import { FixedButtonsGroup } from "../components/form/FixedButtonGroup";
import { RequiredActionMultiSelect } from "./user-credentials/RequiredActionMultiSelect";
import { useNavigate } from "react-router-dom";
import { CopyToClipboardButton } from "../components/copy-to-clipboard-button/CopyToClipboardButton";

export type BruteForced = {
    isBruteForceProtected?: boolean;
    isLocked?: boolean;
};

export type UserFormProps = {
    form: UseFormReturn<UserFormFields>;
    realm: RealmRepresentation;
    user?: UserRepresentation;
    bruteForce?: BruteForced;
    userProfileMetadata?: UserProfileMetadata;
    save: (user: UserFormFields) => void;
    refresh?: () => void;
    onGroupsUpdate?: (groups: GroupRepresentation[]) => void;
};

export const UserForm = ({
    form,
    realm,
    user,
    bruteForce: { isBruteForceProtected, isLocked } = {
        isBruteForceProtected: false,
        isLocked: false
    },
    userProfileMetadata,
    save,
    refresh,
    onGroupsUpdate
}: UserFormProps) => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const formatDate = useFormatDate();
    const { addAlert, addError } = useAlerts();
    const { hasAccess } = useAccess();
    const isManager = hasAccess("manage-users");
    const canViewFederationLink = hasAccess("view-realm");
    const { whoAmI } = useWhoAmI();

    const { handleSubmit, setValue, control, reset, formState } = form;
    const { errors } = formState;

    const [selectedGroups, setSelectedGroups] = useState<GroupRepresentation[]>([]);
    const [open, setOpen] = useState(false);
    const [locked, setLocked] = useState(isLocked);
    const navigate = useNavigate();

    useEffect(() => {
        setValue("requiredActions", user?.requiredActions || []);
    }, [user, setValue]);

    const unLockUser = async () => {
        try {
            await adminClient.users.update({ id: user!.id! }, { enabled: true });
            addAlert(t("unlockSuccess"), AlertVariant.success);
            if (refresh) {
                refresh();
            }
        } catch (error) {
            addError("unlockError", error);
        }
    };

    const deleteItem = (id: string) => {
        setSelectedGroups(selectedGroups.filter(item => item.name !== id));
        onGroupsUpdate?.(selectedGroups);
    };

    const addChips = async (groups: GroupRepresentation[]): Promise<void> => {
        setSelectedGroups([...selectedGroups!, ...groups]);
        onGroupsUpdate?.([...selectedGroups!, ...groups]);
    };

    const addGroups = async (groups: GroupRepresentation[]): Promise<void> => {
        const newGroups = groups;

        newGroups.forEach(async group => {
            try {
                await adminClient.users.addToGroup({
                    id: user!.id!,
                    groupId: group.id!
                });
                addAlert(t("addedGroupMembership"), AlertVariant.success);
            } catch (error) {
                addError("addedGroupMembershipError", error);
            }
        });
    };

    const toggleModal = () => {
        setOpen(!open);
    };

    const onFormReset = () => {
        if (user?.id) {
            reset(toUserFormFields(user));
        } else {
            navigate(toUsers({ realm: realm.realm! }));
        }
    };

    const allFieldsReadOnly = () =>
        user?.userProfileMetadata?.attributes &&
        !user?.userProfileMetadata?.attributes
            ?.map(a => a.readOnly)
            .reduce((p, c) => p && c, true);

    const handleEmailVerificationReset = async () => {
        try {
            save(
                toUserFormFields({
                    ...user,
                    requiredActions: user?.requiredActions?.filter(
                        action => action !== "UPDATE_EMAIL"
                    ),
                    attributes: {
                        ...user?.attributes,
                        "kc.email.pending": ""
                    }
                })
            );
            if (refresh) {
                refresh();
            }
        } catch (error) {
            addError("emailPendingVerificationUpdateError", error);
        }
    };

    return (
        <FormAccess
            isHorizontal
            onSubmit={handleSubmit(save)}
            role="query-users"
            fineGrainedAccess={user?.access?.manage}
            className="mt-6"
        >
            <FormProvider {...form}>
                {open && (
                    <GroupPickerDialog
                        type="selectMany"
                        text={{
                            title: "selectGroups",
                            ok: "join"
                        }}
                        canBrowse={isManager}
                        onConfirm={async groups => {
                            if (user?.id) {
                                await addGroups(groups || []);
                            } else {
                                await addChips(groups || []);
                            }

                            setOpen(false);
                        }}
                        onClose={() => setOpen(false)}
                        filterGroups={selectedGroups}
                    />
                )}
                {user?.id && (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="kc-id">{t("id")} *</Label>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <Input
                                        id={user.id}
                                        aria-label={t("userID")}
                                        value={user.id}
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <CopyToClipboardButton
                                        id={`user-${user.id}`}
                                        text={user.id}
                                        label={t("userID")}
                                        variant="control"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="kc-created-at">{t("createdAt")} *</Label>
                            <Input
                                value={formatDate(new Date(user.createdTimestamp!))}
                                id="kc-created-at"
                                readOnly
                            />
                        </div>
                    </>
                )}
                <RequiredActionMultiSelect
                    name="requiredActions"
                    label="requiredUserActions"
                    help="requiredUserActionsHelp"
                />
                {user?.federationLink && canViewFederationLink && (
                    <div className="space-y-2">
                        <div className="flex items-center gap-1">
                            <Label>{t("federationLink")}</Label>
                            <HelpItem
                                helpText={t("federationLinkHelp")}
                                fieldLabelId="federationLink"
                            />
                        </div>
                        <FederatedUserLink user={user} />
                    </div>
                )}
                {userProfileMetadata ? (
                    <>
                        <DefaultSwitchControl
                            name="emailVerified"
                            label={t("emailVerified")}
                            labelIcon={t("emailVerifiedHelp")}
                        />
                        {user?.attributes?.["kc.email.pending"] && (
                            <Alert variant="warning">
                                <AlertDescription>
                                    <p className="font-semibold">{t("emailPendingVerificationAlertTitle")}</p>
                                    {t("userNotYetConfirmedNewEmail", {
                                        email: user.attributes!["kc.email.pending"]
                                    })}
                                    <ContinueCancelModal
                                        buttonTitle={t("emailPendingVerificationResetAction")}
                                        modalTitle={t(
                                            "confirmEmailPendingVerificationAction"
                                        )}
                                        continueLabel={t("confirm")}
                                        cancelLabel={t("cancel")}
                                        buttonVariant="link"
                                        onContinue={handleEmailVerificationReset}
                                    >
                                        {t("emailPendingVerificationActionMessage")}
                                    </ContinueCancelModal>
                                </AlertDescription>
                            </Alert>
                        )}
                        <UserProfileFields
                            form={form}
                            userProfileMetadata={{
                                ...userProfileMetadata,
                                attributes: userProfileMetadata.attributes?.filter(
                                    (attribute: UserProfileAttributeMetadata) => {
                                        return attribute.name !== "kc.email.pending";
                                    }
                                )
                            }}
                            hideReadOnly={!user}
                            supportedLocales={realm.supportedLocales || []}
                            currentLocale={whoAmI.locale}
                            t={
                                ((key: unknown, params) =>
                                    t(key as string, params as any)) as TFunction
                            }
                        />
                    </>
                ) : (
                    <>
                        {!realm.registrationEmailAsUsername && (
                            <TextControl
                                name="username"
                                label={t("username")}
                                readOnly={
                                    !!user?.id &&
                                    !realm.editUsernameAllowed &&
                                    realm.editUsernameAllowed !== undefined
                                }
                                rules={{
                                    required: t("required")
                                }}
                            />
                        )}
                        <TextControl
                            name="email"
                            label={t("email")}
                            type="email"
                            rules={{
                                pattern: {
                                    value: emailRegexPattern,
                                    message: t("emailInvalid")
                                }
                            }}
                        />
                        <SwitchControl
                            name="emailVerified"
                            label={t("emailVerified")}
                            labelIcon={t("emailVerifiedHelp")}
                            labelOn={t("yes")}
                            labelOff={t("no")}
                        />
                        <TextControl name="firstName" label={t("firstName")} />
                        <TextControl name="lastName" label={t("lastName")} />
                    </>
                )}
                {isBruteForceProtected && (
                    <div className="space-y-2">
                        <div className="flex items-center gap-1">
                            <Label htmlFor="temporaryLocked">{t("temporaryLocked")}</Label>
                            <HelpItem
                                helpText={t("temporaryLockedHelp")}
                                fieldLabelId="temporaryLocked"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch
                                data-testid="user-locked-switch"
                                id="temporaryLocked"
                                onCheckedChange={async (value) => {
                                    await unLockUser();
                                    setLocked(value);
                                }}
                                checked={locked}
                                disabled={!locked}
                            />
                            <span className="text-sm">{locked ? t("on") : t("off")}</span>
                        </div>
                    </div>
                )}
                {!user?.id && (
                    <div className="space-y-2">
                        <div className="flex items-center gap-1">
                            <Label htmlFor="kc-groups">{t("groups")}</Label>
                            <HelpItem helpText={t("groupsHelp")} fieldLabelId="groups" />
                        </div>
                        <Controller
                            name="groups"
                            defaultValue={[]}
                            control={control}
                            render={() => (
                                <div className="flex gap-2 items-center flex-wrap">
                                    <div className="flex gap-1 flex-wrap">
                                        {selectedGroups.map(currentChip => (
                                            <Badge
                                                key={currentChip.id}
                                                className="cursor-pointer inline-flex items-center gap-1"
                                                onClick={() =>
                                                    deleteItem(currentChip.name!)
                                                }
                                            >
                                                {currentChip.path}
                                                <X className="size-3" />
                                            </Badge>
                                        ))}
                                    </div>
                                    <div>
                                        <Button
                                            id="kc-join-groups-button"
                                            onClick={toggleModal}
                                            variant="secondary"
                                            data-testid="join-groups-button"
                                        >
                                            {t("joinGroups")}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        />
                        {errors.requiredActions && (
                            <FormErrorText message={t("required")} />
                        )}
                    </div>
                )}
            </FormProvider>
            <FixedButtonsGroup
                name="user-creation"
                saveText={user?.id ? t("save") : t("create")}
                reset={onFormReset}
                resetText={user?.id ? t("revert") : t("cancel")}
                isDisabled={allFieldsReadOnly()}
                isSubmit
            />
        </FormAccess>
    );
};
