import type {
    UserProfileConfig,
    UserProfileMetadata
} from "@keycloak/keycloak-admin-client/lib/defs/userProfileMetadata";
import { type TFunction, useTranslation } from "@merge-rd/i18n";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@merge-rd/ui/components/alert-dialog";
import { buttonVariants } from "@merge-rd/ui/components/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@merge-rd/ui/components/dropdown-menu";
import { Label } from "@merge-rd/ui/components/label";
import { Switch } from "@merge-rd/ui/components/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@merge-rd/ui/components/tabs";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from "@merge-rd/ui/components/tooltip";
import { Info } from "@phosphor-icons/react";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
    getErrorDescription,
    getErrorMessage,
    isUserProfileError,
    KeycloakSpinner,
    setUserProfileServerError
} from "../../../shared/keycloak-ui-shared";
import { useAccess } from "../../app/providers/access/access";
import { useRealm } from "../../app/providers/realm-context/realm-context";
import type { UserParams } from "../../shared/lib/routes/user";
import { toUsers } from "../../shared/lib/routes/user";
import { useIsFeatureEnabled, Feature } from "../../shared/lib/use-is-feature-enabled";
import { useParams } from "../../shared/lib/use-params";
import { useConfirmDialog } from "../../shared/ui/confirm-dialog/confirm-dialog";
import type { KeyValueType } from "../../shared/ui/key-value-form/key-value-convert";
import { AdminEvents } from "../events/admin-events";
import { UserEvents } from "../events/user-events";
import { UserProfileProvider } from "../realm-settings/user-profile/user-profile-context";
import { useDeleteUser } from "./hooks/use-delete-user";
import { useImpersonateUser } from "./hooks/use-impersonate-user";
import { useLogoutUser } from "./hooks/use-logout-user";
import { useUpdateUser } from "./hooks/use-update-user";
import { useUserDetail } from "./hooks/use-user-detail";
import {
    filterManagedAttributes,
    toUserFormFields,
    toUserRepresentation,
    type UIUserRepresentation,
    type UserFormFields
} from "./form-state";
import { Organizations } from "./organizations";
import { UserAttributes } from "./user-attributes";
import { UserConsents } from "./user-consents";
import { UserCredentials } from "./user-credentials";
import { type BruteForced, UserForm } from "./user-form";
import { UserGroups } from "./user-groups";
import { UserIdentityProviderLinks } from "./user-identity-provider-links";
import { UserRoleMapping } from "./user-role-mapping";
import { UserSessions } from "./user-sessions";
import { isLightweightUser } from "./utils";

export function EditUser() {

    const { t } = useTranslation();
    const navigate = useNavigate();
    const { hasAccess } = useAccess();
    const { id, tab } = useParams<UserParams & { tab?: string }>();
    const { realm: realmName, realmRepresentation: realm } = useRealm();
    // Validation of form fields is performed on server, thus we need to clear all errors before submit
    const clearAllErrorsBeforeSubmit = async (values: UserFormFields) => ({
        values,
        errors: {}
    });
    const form = useForm<UserFormFields>({
        mode: "onChange",
        resolver: clearAllErrorsBeforeSubmit
    });
    const [user, setUser] = useState<UIUserRepresentation>();
    const [bruteForced, setBruteForced] = useState<BruteForced>();
    const [isUnmanagedAttributesEnabled, setUnmanagedAttributesEnabled] =
        useState<boolean>();
    const [userProfileMetadata, setUserProfileMetadata] = useState<UserProfileMetadata>();
    const lightweightUser = isLightweightUser(user?.id);
    const [upConfig, setUpConfig] = useState<UserProfileConfig>();

    const { mutateAsync: updateUserMut } = useUpdateUser(id!);
    const { mutateAsync: deleteUserMut } = useDeleteUser();
    const { mutateAsync: logoutUserMut } = useLogoutUser();
    const { mutateAsync: impersonateUserMut } = useImpersonateUser();

    const [realmHasOrganizations, setRealmHasOrganizations] = useState(false);
    const isFeatureEnabled = useIsFeatureEnabled();
    const showOrganizations =
        isFeatureEnabled(Feature.Organizations) && realm?.organizationsEnabled;

    const [activeEventsTab, setActiveEventsTab] = useState("userEvents");

    const { data: userDetailData, refetch: refetchUserDetail } = useUserDetail(
        id!,
        realmName,
        realm,
        !!showOrganizations
    );
    const refresh = () => refetchUserDetail();

    useEffect(() => {
        if (!userDetailData) return;

        const { userProfileMetadata: upm, ...userData } =
            userDetailData.user as UIUserRepresentation & {
                userProfileMetadata?: UserProfileMetadata;
            };
        // userDetailData already has userProfileMetadata separated
        setUserProfileMetadata(userDetailData.userProfileMetadata);
        userData.unmanagedAttributes = (
            userDetailData.user as UIUserRepresentation
        ).unmanagedAttributes;
        userData.attributes = filterManagedAttributes(
            userData.attributes,
            userData.unmanagedAttributes
        );

        if (userDetailData.isUnmanagedAttributesEnabled) {
            setUnmanagedAttributesEnabled(true);
        }

        setUser(userDetailData.user);
        setUpConfig(userDetailData.upConfig);
        setBruteForced(userDetailData.bruteForced);
        setRealmHasOrganizations(userDetailData.realmHasOrganizations);

        form.reset(toUserFormFields(userDetailData.user));
    }, [userDetailData, form]);

    const save = async (data: UserFormFields) => {
        try {
            await updateUserMut(toUserRepresentation(data));
            toast.success(t("userSaved"));
            refresh();
        } catch (error) {
            if (isUserProfileError(error)) {
                if (
                    isUnmanagedAttributesEnabled &&
                    Array.isArray(data.unmanagedAttributes)
                ) {
                    const unmanagedAttributeErrors: object[] = new Array(
                        data.unmanagedAttributes.length
                    );
                    let someUnmanagedAttributeError = false;
                    setUserProfileServerError<UserFormFields>(
                        error,
                        (field, params) => {
                            if (field.startsWith("attributes.")) {
                                const attributeName = field.substring(
                                    "attributes.".length
                                );
                                (data.unmanagedAttributes as KeyValueType[]).forEach(
                                    (attr, index) => {
                                        if (attr.key === attributeName) {
                                            unmanagedAttributeErrors[index] = params;
                                            someUnmanagedAttributeError = true;
                                        }
                                    }
                                );
                            } else {
                                form.setError(field, params);
                            }
                        },
                        ((key, param) =>
                            t(
                                key as string,
                                param as Record<string, string>
                            )) as TFunction
                    );
                    if (someUnmanagedAttributeError) {
                        form.setError("unmanagedAttributes", {
                            types: unmanagedAttributeErrors as unknown as Record<
                                string,
                                string
                            >
                        });
                    }
                } else {
                    setUserProfileServerError<UserFormFields>(error, form.setError, ((
                        key,
                        param
                    ) => t(key as string, param as Record<string, string>)) as TFunction);
                }
                toast.error(t("userNotSaved"));
            } else {
                toast.error(t("userCreateError", { error: getErrorMessage(error) }), {
                    description: getErrorDescription(error)
                });
            }
        }
    };

    const [toggleDisableDialog, DisableConfirm] = useConfirmDialog({
        titleKey: "disableConfirmUserTitle",
        messageKey: "disableConfirmUser",
        continueButtonLabel: "disable",
        onConfirm: async () => {
            await save({
                ...toUserFormFields(user!),
                enabled: false
            });
        }
    });

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const onDeleteConfirm = async () => {
        if (!user?.id) return;
        try {
            if (lightweightUser) {
                await logoutUserMut(user.id);
            } else {
                await deleteUserMut(user.id);
            }
            setDeleteDialogOpen(false);
            toast.success(t("userDeletedSuccess"));
            navigate({ to: toUsers({ realm: realmName }) as string });
        } catch (error) {
            toast.error(t("userDeletedError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        }
    };

    const [toggleImpersonateDialog, ImpersonateConfirm] = useConfirmDialog({
        titleKey: "impersonateConfirm",
        messageKey: "impersonateConfirmDialog",
        continueButtonLabel: "impersonate",
        onConfirm: async () => {
            try {
                const data = await impersonateUserMut({
                    id: user!.id!,
                    realm: realmName
                });
                if (data.sameRealm) {
                    window.location = data.redirect;
                } else {
                    window.open(data.redirect, "_blank");
                }
            } catch (error) {
                toast.error(t("impersonateError", { error: getErrorMessage(error) }), {
                    description: getErrorDescription(error)
                });
            }
        }
    });

    if (!user || !bruteForced) {
        return <KeycloakSpinner />;
    }

    const renderContent = () => {
        switch (tab) {
            case "attributes":
                return isUnmanagedAttributesEnabled ? (
                    <UserAttributes user={user} save={save} upConfig={upConfig} />
                ) : null;
            case "credentials":
                return user.access?.view ? (
                    <UserCredentials user={user} setUser={setUser} />
                ) : null;
            case "role-mapping":
                return user.access?.view ? (
                    <UserRoleMapping id={user.id!} name={user.username!} />
                ) : null;
            case "groups":
                return hasAccess("query-groups") ? <UserGroups user={user} /> : null;
            case "organizations":
                return showOrganizations && realmHasOrganizations ? (
                    <Organizations user={user} />
                ) : null;
            case "consents":
                return <UserConsents />;
            case "identity-provider-links":
                return <UserIdentityProviderLinks userId={user.id!} />;
            case "sessions":
                return <UserSessions />;
            case "events":
                return hasAccess("view-events") ? (
                    <Tabs value={activeEventsTab} onValueChange={setActiveEventsTab}>
                        <TabsList>
                            <TabsTrigger value="userEvents">
                                {t("userEvents")}
                            </TabsTrigger>
                            <TabsTrigger value="adminEvents">
                                {t("adminEvents")}
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="userEvents">
                            <UserEvents user={user.id} />
                        </TabsContent>
                        <TabsContent value="adminEvents">
                            <AdminEvents resourcePath={`users/${user.id}*`} />
                        </TabsContent>
                    </Tabs>
                ) : null;
            default:
                return (
                    <div className="p-6">
                        <UserForm
                            form={form}
                            realm={realm!}
                            user={user}
                            bruteForce={bruteForced}
                            userProfileMetadata={userProfileMetadata}
                            refresh={refresh}
                            save={save}
                        />
                    </div>
                );
        }
    };

    return (
        <>
            <ImpersonateConfirm />
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {t("deleteConfirmUsers", { count: 1, name: user?.username })}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("deleteConfirmCurrentUser")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            data-testid="confirm"
                            onClick={onDeleteConfirm}
                        >
                            {t("delete")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <DisableConfirm />
            <div className="flex flex-wrap items-center justify-between gap-2 kc-username-view-header">
                <div className="flex flex-wrap items-center gap-2">
                    {lightweightUser && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Label
                                        data-testid="user-details-label-transient-user"
                                        className="inline-flex items-center gap-1"
                                    >
                                        <Info className="size-4" />
                                        {t("transientUser")}
                                    </Label>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {t("transientUserTooltip")}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 mr-4">
                        <Label htmlFor="user-switch" className="text-sm">
                            {t("enabled")}
                        </Label>
                        <Switch
                            id="user-switch"
                            data-testid="user-switch"
                            checked={user.enabled}
                            aria-label={t("enabled")}
                            onCheckedChange={async value => {
                                if (!value) {
                                    toggleDisableDialog();
                                } else {
                                    await save({
                                        ...toUserFormFields(user),
                                        enabled: value
                                    });
                                }
                            }}
                        />
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            data-testid="action-dropdown"
                            className={buttonVariants()}
                        >
                            {t("action")}
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                key="impersonate"
                                disabled={!user.access?.impersonate}
                                onClick={() => toggleImpersonateDialog()}
                            >
                                {t("impersonate")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                key="delete"
                                disabled={!user.access?.manage}
                                onClick={() => setDeleteDialogOpen(true)}
                            >
                                {t("delete")}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="p-0">
                <UserProfileProvider>
                    <FormProvider {...form}>
                        <div className="bg-muted/30">{renderContent()}</div>
                    </FormProvider>
                </UserProfileProvider>
            </div>
        </>
    );
}
