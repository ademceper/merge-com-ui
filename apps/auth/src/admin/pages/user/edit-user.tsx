import type {
    UserProfileConfig,
    UserProfileMetadata
} from "@keycloak/keycloak-admin-client/lib/defs/userProfileMetadata";
import { getErrorDescription, getErrorMessage, isUserProfileError,
    setUserProfileServerError,
    useFetch } from "../../../shared/keycloak-ui-shared";
import { toast } from "sonner";
import { Label } from "@merge-rd/ui/components/label";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@merge-rd/ui/components/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@merge-rd/ui/components/dropdown-menu";
import { Switch } from "@merge-rd/ui/components/switch";
import { buttonVariants } from "@merge-rd/ui/components/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@merge-rd/ui/components/tabs";
import { Info } from "@phosphor-icons/react";
import { TFunction } from "i18next";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams as useRouterParams } from "react-router-dom";
import { useAdminClient } from "../../app/admin-client";
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
import { useConfirmDialog } from "../../shared/ui/confirm-dialog/confirm-dialog";
import { KeyValueType } from "../../shared/ui/key-value-form/key-value-convert";
import { KeycloakSpinner } from "../../../shared/keycloak-ui-shared";

import { useAccess } from "../../app/providers/access/access";
import { useRealm } from "../../app/providers/realm-context/realm-context";
import { UserProfileProvider } from "../realm-settings/user-profile/user-profile-context";
import useIsFeatureEnabled, { Feature } from "../../shared/lib/useIsFeatureEnabled";
import { useParams } from "../../shared/lib/useParams";
import { Organizations } from "./organizations";
import { UserAttributes } from "./user-attributes";
import { UserConsents } from "./user-consents";
import { UserCredentials } from "./user-credentials";
import { BruteForced, UserForm } from "./user-form";
import { UserGroups } from "./user-groups";
import { UserIdentityProviderLinks } from "./user-identity-provider-links";
import { UserRoleMapping } from "./user-role-mapping";
import { UserSessions } from "./user-sessions";
import { UserEvents } from "../events/user-events";
import {
    UIUserRepresentation,
    UserFormFields,
    filterManagedAttributes,
    toUserFormFields,
    toUserRepresentation
} from "./form-state";
import { UserParams } from "./routes/user";
import { toUsers } from "./routes/users";
import { isLightweightUser } from "./utils";

import { AdminEvents } from "../events/admin-events";

export default function EditUser() {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
const navigate = useNavigate();
    const { hasAccess } = useAccess();
    const { id } = useParams<UserParams>();
    const { tab } = useRouterParams<{ tab?: string }>();
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
    const [refreshCount, setRefreshCount] = useState(0);
    const refresh = () => setRefreshCount(count => count + 1);
    const lightweightUser = isLightweightUser(user?.id);
    const [upConfig, setUpConfig] = useState<UserProfileConfig>();

    const [realmHasOrganizations, setRealmHasOrganizations] = useState(false);
    const isFeatureEnabled = useIsFeatureEnabled();
    const showOrganizations =
        isFeatureEnabled(Feature.Organizations) && realm?.organizationsEnabled;

    const [activeEventsTab, setActiveEventsTab] = useState("userEvents");

    useFetch(
        async () =>
            Promise.all([
                adminClient.users.findOne({
                    id: id!,
                    userProfileMetadata: true
                }) as UIUserRepresentation | undefined,
                adminClient.attackDetection.findOne({ id: id! }),
                adminClient.users.getUnmanagedAttributes({ id: id! }),
                adminClient.users.getProfile({ realm: realmName }),
                showOrganizations
                    ? adminClient.organizations.find({ first: 0, max: 1 })
                    : []
            ]),
        ([userData, attackDetection, unmanagedAttributes, upConfig, organizations]) => {
            if (!userData || !realm || !attackDetection) {
                throw new Error(t("notFound"));
            }

            const { userProfileMetadata, ...user } = userData;
            setUserProfileMetadata(userProfileMetadata);
            user.unmanagedAttributes = unmanagedAttributes;
            user.attributes = filterManagedAttributes(
                user.attributes,
                unmanagedAttributes
            );

            if (upConfig.unmanagedAttributePolicy !== undefined) {
                setUnmanagedAttributesEnabled(true);
            }

            setUser(user);
            setUpConfig(upConfig);

            const isBruteForceProtected = realm.bruteForceProtected;
            const isLocked = isBruteForceProtected && attackDetection.disabled;

            setBruteForced({ isBruteForceProtected, isLocked });
            setRealmHasOrganizations(organizations.length === 1);

            form.reset(toUserFormFields(user));
        },
        [refreshCount]
    );

    const save = async (data: UserFormFields) => {
        try {
            await adminClient.users.update({ id: user!.id! }, toUserRepresentation(data));
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
                        ((key, param) => t(key as string, param as any)) as TFunction
                    );
                    if (someUnmanagedAttributeError) {
                        form.setError(
                            "unmanagedAttributes",
                            unmanagedAttributeErrors as any
                        );
                    }
                } else {
                    setUserProfileServerError<UserFormFields>(error, form.setError, ((
                        key,
                        param
                    ) => t(key as string, param as any)) as TFunction);
                }
                toast.error(t("userNotSaved"));
            } else {
                toast.error(t("userCreateError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
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
                await adminClient.users.logout({ id: user.id });
            } else {
                await adminClient.users.del({ id: user.id });
            }
            setDeleteDialogOpen(false);
            toast.success(t("userDeletedSuccess"));
            navigate(toUsers({ realm: realmName }));
        } catch (error) {
            toast.error(t("userDeletedError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    const [toggleImpersonateDialog, ImpersonateConfirm] = useConfirmDialog({
        titleKey: "impersonateConfirm",
        messageKey: "impersonateConfirmDialog",
        continueButtonLabel: "impersonate",
        onConfirm: async () => {
            try {
                const data = await adminClient.users.impersonation(
                    { id: user!.id! },
                    { user: user!.id!, realm: realmName }
                );
                if (data.sameRealm) {
                    window.location = data.redirect;
                } else {
                    window.open(data.redirect, "_blank");
                }
            } catch (error) {
                toast.error(t("impersonateError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
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
                    <UserAttributes
                        user={user}
                        save={save}
                        upConfig={upConfig}
                    />
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
                return hasAccess("query-groups") ? (
                    <UserGroups user={user} />
                ) : null;
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
                            <AdminEvents
                                resourcePath={`users/${user.id}*`}
                            />
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
                        <AlertDialogTitle>{t("deleteConfirmUsers", { count: 1, name: user?.username })}</AlertDialogTitle>
                        <AlertDialogDescription>{t("deleteConfirmCurrentUser")}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                        <AlertDialogAction variant="destructive" data-testid="confirm" onClick={onDeleteConfirm}>
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
                                <TooltipContent>{t("transientUserTooltip")}</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 mr-4">
                        <Label htmlFor="user-switch" className="text-sm">{t("enabled")}</Label>
                        <Switch id="user-switch" data-testid="user-switch" checked={user.enabled} aria-label={t("enabled")} onCheckedChange={async value => {
                            if (!value) {
                                toggleDisableDialog();
                            } else {
                                await save({
                                    ...toUserFormFields(user),
                                    enabled: value
                                });
                            }
                        }} />
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger data-testid="action-dropdown" className={buttonVariants()}>
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
                        <div className="bg-muted/30">
                            {renderContent()}
                        </div>
                    </FormProvider>
                </UserProfileProvider>
            </div>
        </>
    );
}
