import { fetchWithError } from "@keycloak/keycloak-admin-client";
import type RealmRepresentation from "@keycloak/keycloak-admin-client/lib/defs/realmRepresentation";
import { UserProfileConfig } from "@keycloak/keycloak-admin-client/lib/defs/userProfileMetadata";
import { getErrorDescription, getErrorMessage, useEnvironment } from "../../shared/keycloak-ui-shared";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@merge-rd/ui/components/dropdown-menu";
import { Label } from "@merge-rd/ui/components/label";
import { Switch } from "@merge-rd/ui/components/switch";
import { buttonVariants } from "@merge-rd/ui/components/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@merge-rd/ui/components/tabs";
import { DotsThreeVertical, DownloadSimple, UploadSimple, Trash } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAdminClient } from "../admin-client";
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
import { useConfirmDialog } from "../components/confirm-dialog/confirm-dialog";
import type { KeyValueType } from "../components/key-value-form/key-value-convert";

import { useAccess } from "../context/access/access";
import { useRealm } from "../context/realm-context/realm-context";
import { toDashboard } from "../dashboard/routes/dashboard";
import type { Environment } from "../environment";
import { convertFormValuesToObject, convertToFormValues } from "../util";
import { getAuthorizationHeaders } from "../utils/getAuthorizationHeaders";
import { joinPath } from "../utils/joinPath";
import useIsFeatureEnabled, { Feature } from "../utils/useIsFeatureEnabled";
import useLocale from "../utils/useLocale";
import { RealmSettingsEmailTab } from "./email-tab";
import { RealmSettingsGeneralTab } from "./general-tab";
import { RealmSettingsLoginTab } from "./login-tab";
import { PartialExportDialog } from "./partial-export";
import { PartialImportDialog } from "./partial-import";
import { PoliciesTab } from "./policies-tab";
import ProfilesTab from "./profiles-tab";
import { RealmSettingsSessionsTab } from "./sessions-tab";
import ThemesTab from "./themes/themes-tab";
import { RealmSettingsTokensTab } from "./tokens-tab";
import { UserRegistration } from "./user-registration";
import { EventsTab } from "./event-config/events-tab";
import { KeysTab } from "./keys/keys-tab";
import { LocalizationTab } from "./localization/localization-tab";
import { toClientPolicies } from "./routes/client-policies";
import type { ClientPoliciesTab } from "./routes/client-policies";
import { toRealmSettings } from "./routes/realm-settings";
import type { RealmSettingsTab } from "./routes/realm-settings";
import { SecurityDefenses } from "./security-defences/security-defenses";
import { UserProfileTab } from "./user-profile/user-profile-tab";

export interface UIRealmRepresentation extends RealmRepresentation {
    upConfig?: UserProfileConfig;
}

type RealmSettingsHeaderProps = {
    onChange: (value: boolean) => void;
    value: boolean;
    save: () => void;
    realmName: string;
    refresh: () => void;
};

const RealmSettingsHeader = ({
    save,
    onChange,
    value,
    realmName,
    refresh
}: RealmSettingsHeaderProps) => {
    const { adminClient } = useAdminClient();
    const { environment } = useEnvironment<Environment>();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [partialImportOpen, setPartialImportOpen] = useState(false);
    const [partialExportOpen, setPartialExportOpen] = useState(false);
    const [deleteRealmDialogOpen, setDeleteRealmDialogOpen] = useState(false);
    const { hasAccess } = useAccess();
    const canManageRealm = hasAccess("manage-realm");

    const [toggleDisableDialog, DisableConfirm] = useConfirmDialog({
        titleKey: "disableConfirmTitle",
        messageKey: "disableConfirmRealm",
        continueButtonLabel: "disable",
        onConfirm: () => {
            onChange(!value);
            save();
        }
    });

    const onDeleteRealmConfirm = async () => {
        try {
            await adminClient.realms.del({ realm: realmName });
            setDeleteRealmDialogOpen(false);
            toast.success(t("deletedSuccessRealmSetting"));
            navigate(toDashboard({ realm: environment.masterRealm }));
            refresh();
        } catch (error) {
            toast.error(t("deleteErrorRealmSetting", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    return (
        <>
            <DisableConfirm />
            <AlertDialog open={deleteRealmDialogOpen} onOpenChange={setDeleteRealmDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("deleteConfirmTitle")}</AlertDialogTitle>
                        <AlertDialogDescription>{t("deleteConfirmRealmSetting")}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                        <AlertDialogAction variant="destructive" data-testid="confirm" onClick={onDeleteRealmConfirm}>
                            {t("delete")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <PartialImportDialog
                open={partialImportOpen}
                toggleDialog={() => setPartialImportOpen(!partialImportOpen)}
            />
            <PartialExportDialog
                isOpen={partialExportOpen}
                onClose={() => setPartialExportOpen(false)}
            />
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2" />
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 mr-4">
                        <Label htmlFor="realm-settings-switch" className="text-sm">{t("enabled")}</Label>
                        <Switch id="realm-settings-switch" data-testid="realm-settings-switch" disabled={!canManageRealm} checked={value} aria-label={t("enabled")} onCheckedChange={val => {
                            if (!val) {
                                toggleDisableDialog();
                            } else {
                                onChange(val);
                                save();
                            }
                        }} />
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger data-testid="action-dropdown" className={buttonVariants({ variant: "ghost", size: "icon" })}>
                            <DotsThreeVertical className="size-5" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                key="import"
                                data-testid="openPartialImportModal"
                                disabled={!canManageRealm}
                                onClick={() => setPartialImportOpen(true)}
                            >
                                <DownloadSimple className="size-4 shrink-0" />
                                {t("partialImport")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                key="export"
                                data-testid="openPartialExportModal"
                                disabled={!canManageRealm}
                                onClick={() => setPartialExportOpen(true)}
                            >
                                <UploadSimple className="size-4 shrink-0" />
                                {t("partialExport")}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator key="separator" />
                            <DropdownMenuItem
                                key="delete"
                                disabled={!canManageRealm}
                                onClick={() => setDeleteRealmDialogOpen(true)}
                                className="text-destructive focus:text-destructive"
                            >
                                <Trash className="size-4 shrink-0" />
                                {t("delete")}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </>
    );
};

function ClientPoliciesSubTabs({ realmName: _realmName, subTab = "profiles" }: { realmName: string; subTab?: string }) {
    if (subTab === "policies") {
        return <PoliciesTab />;
    }
    return <ProfilesTab />;
}

export const RealmSettingsTabs = () => {
    const { adminClient } = useAdminClient();
    const { t } = useTranslation();
    const { realm: realmName, realmRepresentation: realm, refresh } = useRealm();
    const combinedLocales = useLocale();
    const navigate = useNavigate();
    const isFeatureEnabled = useIsFeatureEnabled();
    const [tableData, setTableData] = useState<Record<string, string>[] | undefined>(
        undefined
    );
    const form = useForm({
        mode: "onChange"
    });
    const { control, setValue, getValues } = form;
    const [key, setKey] = useState(0);
    const refreshHeader = () => {
        setKey(key + 1);
    };

    const setupForm = (r: RealmRepresentation = realm!) => {
        convertToFormValues(r, setValue);
    };

    useEffect(() => {
        setupForm();
        const fetchLocalizationTexts = async () => {
            try {
                await Promise.all(
                    combinedLocales.map(async locale => {
                        try {
                            const response =
                                await adminClient.realms.getRealmLocalizationTexts({
                                    realm: realmName,
                                    selectedLocale: locale
                                });

                            if (response) {
                                setTableData([response]);
                            }
                        } catch {
                            return [];
                        }
                    })
                );
            } catch {
                return [];
            }
        };
        void fetchLocalizationTexts();
    }, [setValue, realm]);

    const save = async (r: UIRealmRepresentation) => {
        r = convertFormValuesToObject(r);
        if (
            r.attributes?.["acr.loa.map"] &&
            typeof r.attributes["acr.loa.map"] !== "string"
        ) {
            r.attributes["acr.loa.map"] = JSON.stringify(
                Object.fromEntries(
                    (r.attributes["acr.loa.map"] as KeyValueType[])
                        .filter(({ key }) => key !== "")
                        .map(({ key, value }) => [key, value])
                )
            );
        }

        try {
            const savedRealm: UIRealmRepresentation = {
                ...realm,
                ...r,
                id: r.realm
            };

            // For the default value, null is expected instead of an empty string.
            if (savedRealm.smtpServer?.port === "") {
                savedRealm.smtpServer = { ...savedRealm.smtpServer, port: null };
            }
            const response = await fetchWithError(
                joinPath(adminClient.baseUrl, `admin/realms/${realmName}/ui-ext`),
                {
                    method: "PUT",
                    body: JSON.stringify(savedRealm),
                    headers: {
                        "Content-Type": "application/json",
                        ...getAuthorizationHeaders(await adminClient.getAccessToken())
                    }
                }
            );
            if (!response.ok) throw new Error(response.statusText);
            toast.success(t("realmSaveSuccess"));
        } catch (error) {
            toast.error(t("realmSaveError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }

        const isRealmRenamed = realmName !== (r.realm || realm?.realm);
        if (isRealmRenamed) {
            navigate(toRealmSettings({ realm: r.realm!, tab: "general" }));
        }
        refresh();
    };

    const { tab } = useParams<{ tab?: string }>();
    const location = useLocation();
    const { hasAccess, hasSomeAccess } = useAccess();
    const canViewOrManageEvents =
        hasAccess("view-realm") && hasSomeAccess("view-events", "manage-events");
    const canViewUserRegistration =
        hasAccess("view-realm") && hasSomeAccess("view-clients", "manage-clients");

    // Check if we're in a sub-tab route by examining the pathname
    const isThemesSubTab = location.pathname.includes("/realm-settings/themes/");
    const isKeysSubTab = location.pathname.includes("/realm-settings/keys/");
    const isUserProfileSubTab = location.pathname.includes("/realm-settings/user-profile/");
    const isClientPoliciesSubTab = location.pathname.includes("/realm-settings/client-policies/");

    const renderContent = () => {
        // Handle sub-tab routes where tab param contains the sub-tab value
        if (isThemesSubTab) {
            return <ThemesTab realm={realm!} save={save} subTab={tab} />;
        }
        if (isKeysSubTab) {
            return <KeysTab subTab={tab} />;
        }
        if (isUserProfileSubTab) {
            return <UserProfileTab setTableData={setTableData as any} subTab={tab} />;
        }
        if (isClientPoliciesSubTab && isFeatureEnabled(Feature.ClientPolicies)) {
            const clientPoliciesTab: ClientPoliciesTab =
                tab === "policies" ? "policies" : "profiles";
            return (
                <Tabs
                    value={clientPoliciesTab}
                    onValueChange={(value) =>
                        navigate(toClientPolicies({ realm: realmName!, tab: value as ClientPoliciesTab }))
                    }
                >
                    <TabsList variant="line" className="mb-4">
                        <TabsTrigger value="profiles" data-testid="rs-client-policies-profiles-tab">
                            {t("profiles")}
                        </TabsTrigger>
                        <TabsTrigger value="policies" data-testid="rs-client-policies-policies-tab">
                            {t("policies")}
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="profiles">
                        <ProfilesTab />
                    </TabsContent>
                    <TabsContent value="policies">
                        <PoliciesTab />
                    </TabsContent>
                </Tabs>
            );
        }

        switch (tab) {
            case "general":
                return <RealmSettingsGeneralTab realm={realm!} save={save} />;
            case "login":
                return <RealmSettingsLoginTab refresh={refresh} realm={realm!} />;
            case "email":
                return <RealmSettingsEmailTab realm={realm!} save={save} />;
            case "themes":
                return <ThemesTab realm={realm!} save={save} subTab="settings" />;
            case "keys":
                return <KeysTab subTab="list" />;
            case "events":
                return canViewOrManageEvents ? <EventsTab realm={realm!} /> : null;
            case "localization":
                return (
                    <LocalizationTab
                        key={key}
                        save={save}
                        realm={realm!}
                        tableData={tableData}
                    />
                );
            case "security-defenses":
                return <SecurityDefenses realm={realm!} save={save} />;
            case "sessions":
                return <RealmSettingsSessionsTab key={key} realm={realm!} save={save} />;
            case "tokens":
                return <RealmSettingsTokensTab save={save} realm={realm!} />;
            case "client-policies":
                return isFeatureEnabled(Feature.ClientPolicies) ? (
                    <ClientPoliciesSubTabs realmName={realmName} subTab="profiles" />
                ) : null;
            case "user-profile":
                return <UserProfileTab setTableData={setTableData as any} subTab="attributes" />;
            case "user-registration":
                return canViewUserRegistration ? <UserRegistration /> : null;
            default:
                return <RealmSettingsGeneralTab realm={realm!} save={save} />;
        }
    };

    const currentTab: RealmSettingsTab = (() => {
        if (isThemesSubTab) return "themes";
        if (isKeysSubTab) return "keys";
        if (isUserProfileSubTab) return "user-profile";
        if (isClientPoliciesSubTab) return "client-policies";
        return (tab as RealmSettingsTab) || "general";
    })();

    return (
        <FormProvider {...form}>
            <Controller
                name="enabled"
                defaultValue={true}
                control={control}
                render={({ field }) => (
                    <RealmSettingsHeader
                        value={field.value}
                        onChange={field.onChange}
                        realmName={realmName}
                        refresh={refreshHeader}
                        save={() => save(getValues())}
                    />
                )}
            />
            <div className="pt-4 pb-6 px-0 min-w-0">
                <Tabs
                    value={currentTab}
                    onValueChange={(value) =>
                        navigate(toRealmSettings({ realm: realmName, tab: value as RealmSettingsTab }))
                    }
                >
                    <div className="w-full min-w-0 overflow-x-auto overflow-y-hidden mb-4">
                        <TabsList variant="line" className="mb-0 w-max min-w-0 **:data-[slot=tabs-trigger]:flex-none">
                            <TabsTrigger value="general" data-testid="rs-general-tab">
                                {t("general")}
                            </TabsTrigger>
                            <TabsTrigger value="login" data-testid="rs-login-tab">
                                {t("login")}
                            </TabsTrigger>
                            <TabsTrigger value="email" data-testid="rs-email-tab">
                                {t("email")}
                            </TabsTrigger>
                            <TabsTrigger value="themes" data-testid="rs-themes-tab">
                                {t("themes")}
                            </TabsTrigger>
                            <TabsTrigger value="keys" data-testid="rs-keys-tab">
                                {t("keys")}
                            </TabsTrigger>
                            {canViewOrManageEvents && (
                                <TabsTrigger value="events" data-testid="rs-events-tab">
                                    {t("events")}
                                </TabsTrigger>
                            )}
                            <TabsTrigger value="localization" data-testid="rs-localization-tab">
                                {t("localization")}
                            </TabsTrigger>
                            <TabsTrigger value="security-defenses" data-testid="rs-security-defenses-tab">
                                {t("securityDefences")}
                            </TabsTrigger>
                            <TabsTrigger value="sessions" data-testid="rs-sessions-tab">
                                {t("sessions")}
                            </TabsTrigger>
                            <TabsTrigger value="tokens" data-testid="rs-tokens-tab">
                                {t("tokens")}
                            </TabsTrigger>
                            {isFeatureEnabled(Feature.ClientPolicies) && (
                                <TabsTrigger value="client-policies" data-testid="rs-client-policies-tab">
                                    {t("clientPolicies")}
                                </TabsTrigger>
                            )}
                            <TabsTrigger value="user-profile" data-testid="rs-user-profile-tab">
                                {t("attributes")}
                            </TabsTrigger>
                            {canViewUserRegistration && (
                                <TabsTrigger value="user-registration" data-testid="rs-user-registration-tab">
                                    {t("registration")}
                                </TabsTrigger>
                            )}
                        </TabsList>
                    </div>
                    <TabsContent value={currentTab} className="mt-0 pt-0 outline-none">
                        {renderContent()}
                    </TabsContent>
                </Tabs>
            </div>
        </FormProvider>
    );
};
