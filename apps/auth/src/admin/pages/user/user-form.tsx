import type GroupRepresentation from "@keycloak/keycloak-admin-client/lib/defs/groupRepresentation";
import type RealmRepresentation from "@keycloak/keycloak-admin-client/lib/defs/realmRepresentation";
import type {
    UserProfileAttributeMetadata,
    UserProfileMetadata
} from "@keycloak/keycloak-admin-client/lib/defs/userProfileMetadata";
import type UserRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userRepresentation";
import { type TFunction, useTranslation } from "@merge-rd/i18n";
import { Alert, AlertDescription } from "@merge-rd/ui/components/alert";
import { Badge } from "@merge-rd/ui/components/badge";
import { Button } from "@merge-rd/ui/components/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@merge-rd/ui/components/dialog";
import { Input } from "@merge-rd/ui/components/input";
import { Label } from "@merge-rd/ui/components/label";
import { Switch } from "@merge-rd/ui/components/switch";
import { X } from "@phosphor-icons/react";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Controller, FormProvider, type UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import {
    FormErrorText,
    getErrorDescription,
    getErrorMessage,
    HelpItem,
    SwitchControl,
    TextControl,
    UserProfileFields
} from "@/shared/keycloak-ui-shared";
import { useAccess } from "@/admin/app/providers/access/access";
import { useWhoAmI } from "@/admin/app/providers/whoami/who-am-i";
import { toUsers } from "@/admin/shared/lib/routes/user";
import { useFormatDate } from "@/admin/shared/lib/use-format-date";
import { emailRegexPattern } from "@/admin/shared/lib/util";
import { CopyToClipboardButton } from "@/admin/shared/ui/copy-to-clipboard-button/copy-to-clipboard-button";
import { FixedButtonsGroup } from "@/admin/shared/ui/form/fixed-button-group";
import { FormAccess } from "@/admin/shared/ui/form/form-access";
import { GroupPickerDialog } from "@/admin/shared/ui/group/group-picker-dialog";
import { DefaultSwitchControl } from "@/admin/shared/ui/switch-control";
import { FederatedUserLink } from "./federated-user-link";
import { toUserFormFields, type UserFormFields } from "./form-state";
import { useAddUserToGroups } from "./hooks/use-add-user-to-groups";
import { useUpdateUser } from "./hooks/use-update-user";
import { RequiredActionMultiSelect } from "./user-credentials/required-action-multi-select";

export type BruteForced = {
    isBruteForceProtected?: boolean;
    isLocked?: boolean;
};

type UserFormProps = {
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

    const { t } = useTranslation();
    const formatDate = useFormatDate();
    const { hasAccess } = useAccess();
    const isManager = hasAccess("manage-users");
    const canViewFederationLink = hasAccess("view-realm");
    const { whoAmI } = useWhoAmI();

    const { mutateAsync: updateUserMut } = useUpdateUser(user?.id ?? "");
    const { mutateAsync: addUserToGroupsMut } = useAddUserToGroups(user?.id ?? "");

    const { handleSubmit, setValue, control, reset, formState } = form;
    const { errors } = formState;

    const [selectedGroups, setSelectedGroups] = useState<GroupRepresentation[]>([]);
    const [open, setOpen] = useState(false);
    const [locked, setLocked] = useState(isLocked);
    const [emailVerificationDialogOpen, setEmailVerificationDialogOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setValue("requiredActions", user?.requiredActions || []);
    }, [user, setValue]);

    const unLockUser = async () => {
        try {
            await updateUserMut({ enabled: true });
            toast.success(t("unlockSuccess"));
            if (refresh) {
                refresh();
            }
        } catch (error) {
            toast.error(t("unlockError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
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
        try {
            await addUserToGroupsMut(groups);
            toast.success(t("addedGroupMembership"));
        } catch (error) {
            toast.error(
                t("addedGroupMembershipError", { error: getErrorMessage(error) }),
                { description: getErrorDescription(error) }
            );
        }
    };

    const toggleModal = () => {
        setOpen(!open);
    };

    const onFormReset = () => {
        if (user?.id) {
            reset(toUserFormFields(user));
        } else {
            navigate({ to: toUsers({ realm: realm.realm! }) as string });
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
            toast.error(
                t("emailPendingVerificationUpdateError", {
                    error: getErrorMessage(error)
                }),
                { description: getErrorDescription(error) }
            );
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
                                        variant="outline"
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
                            <Alert variant="destructive">
                                <AlertDescription>
                                    <p className="font-semibold">
                                        {t("emailPendingVerificationAlertTitle")}
                                    </p>
                                    {t("userNotYetConfirmedNewEmail", {
                                        email: user.attributes!["kc.email.pending"]
                                    })}
                                    <Button
                                        variant="link"
                                        className="p-0 h-auto font-semibold"
                                        onClick={() =>
                                            setEmailVerificationDialogOpen(true)
                                        }
                                    >
                                        {t("emailPendingVerificationResetAction")}
                                    </Button>
                                    <Dialog
                                        open={emailVerificationDialogOpen}
                                        onOpenChange={setEmailVerificationDialogOpen}
                                    >
                                        <DialogContent
                                            showCloseButton
                                            className="sm:max-w-sm"
                                        >
                                            <DialogHeader>
                                                <DialogTitle>
                                                    {t(
                                                        "confirmEmailPendingVerificationAction"
                                                    )}
                                                </DialogTitle>
                                            </DialogHeader>
                                            {t("emailPendingVerificationActionMessage")}
                                            <DialogFooter>
                                                <Button
                                                    id="modal-confirm"
                                                    onClick={() => {
                                                        setEmailVerificationDialogOpen(
                                                            false
                                                        );
                                                        handleEmailVerificationReset();
                                                    }}
                                                >
                                                    {t("confirm")}
                                                </Button>
                                                <Button
                                                    id="modal-cancel"
                                                    variant="outline"
                                                    onClick={() =>
                                                        setEmailVerificationDialogOpen(
                                                            false
                                                        )
                                                    }
                                                >
                                                    {t("cancel")}
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
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
                            <Label htmlFor="temporaryLocked">
                                {t("temporaryLocked")}
                            </Label>
                            <HelpItem
                                helpText={t("temporaryLockedHelp")}
                                fieldLabelId="temporaryLocked"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch
                                data-testid="user-locked-switch"
                                id="temporaryLocked"
                                onCheckedChange={async value => {
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
