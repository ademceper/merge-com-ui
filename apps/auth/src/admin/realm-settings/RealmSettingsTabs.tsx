import { fetchWithError } from "@keycloak/keycloak-admin-client";
import type RealmRepresentation from "@keycloak/keycloak-admin-client/lib/defs/realmRepresentation";
import { UserProfileConfig } from "@keycloak/keycloak-admin-client/lib/defs/userProfileMetadata";
import { getErrorDescription, getErrorMessage, useEnvironment } from "../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import {
    DropdownMenuItem,
    DropdownMenuSeparator
} from "@merge/ui/components/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@merge/ui/components/tabs";
import { DotsThreeVertical, DownloadSimple, UploadSimple, Trash } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAdminClient } from "../admin-client";
import { useConfirmDialog } from "../components/confirm-dialog/ConfirmDialog";
import type { KeyValueType } from "../components/key-value-form/key-value-convert";
import { ViewHeader } from "../components/view-header/ViewHeader";
import { useAccess } from "../context/access/Access";
import { useRealm } from "../context/realm-context/RealmContext";
import { toDashboard } from "../dashboard/routes/Dashboard";
import type { Environment } from "../environment";
import helpUrls from "../help-urls";
import { convertFormValuesToObject, convertToFormValues } from "../util";
import { getAuthorizationHeaders } from "../utils/getAuthorizationHeaders";
import { joinPath } from "../utils/joinPath";
import useIsFeatureEnabled, { Feature } from "../utils/useIsFeatureEnabled";
import useLocale from "../utils/useLocale";
import { RealmSettingsEmailTab } from "./EmailTab";
import { RealmSettingsGeneralTab } from "./GeneralTab";
import { RealmSettingsLoginTab } from "./LoginTab";
import { PartialExportDialog } from "./PartialExport";
import { PartialImportDialog } from "./PartialImport";
import { PoliciesTab } from "./PoliciesTab";
import ProfilesTab from "./ProfilesTab";
import { RealmSettingsSessionsTab } from "./SessionsTab";
import ThemesTab from "./themes/ThemesTab";
import { RealmSettingsTokensTab } from "./TokensTab";
import { UserRegistration } from "./UserRegistration";
import { EventsTab } from "./event-config/EventsTab";
import { KeysTab } from "./keys/KeysTab";
import { LocalizationTab } from "./localization/LocalizationTab";
import { toClientPolicies } from "./routes/ClientPolicies";
import type { ClientPoliciesTab } from "./routes/ClientPolicies";
import { toRealmSettings } from "./routes/RealmSettings";
import { SecurityDefenses } from "./security-defences/SecurityDefenses";
import { UserProfileTab } from "./user-profile/UserProfileTab";

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

    const [toggleDeleteDialog, DeleteConfirm] = useConfirmDialog({
        titleKey: "deleteConfirmTitle",
        messageKey: "deleteConfirmRealmSetting",
        continueButtonLabel: "delete",
        continueButtonVariant: "destructive",
        onConfirm: async () => {
            try {
                await adminClient.realms.del({ realm: realmName });
                toast.success(t("deletedSuccessRealmSetting"));
                navigate(toDashboard({ realm: environment.masterRealm }));
                refresh();
            } catch (error) {
                toast.error(t("deleteErrorRealmSetting", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
            }
        }
    });

    return (
        <>
            <DisableConfirm />
            <DeleteConfirm />
            <PartialImportDialog
                open={partialImportOpen}
                toggleDialog={() => setPartialImportOpen(!partialImportOpen)}
            />
            <PartialExportDialog
                isOpen={partialExportOpen}
                onClose={() => setPartialExportOpen(false)}
            />
            <ViewHeader
                titleKey={realmName}
                subKey="realmSettingsExplain"
                helpUrl={helpUrls.realmSettingsUrl}
                divider
                dropdownIcon={<DotsThreeVertical className="size-5" />}
                dropdownItems={[
                    <DropdownMenuItem
                        key="import"
                        data-testid="openPartialImportModal"
                        disabled={!canManageRealm}
                        onClick={() => setPartialImportOpen(true)}
                    >
                        <DownloadSimple className="size-4 shrink-0" />
                        {t("partialImport")}
                    </DropdownMenuItem>,
                    <DropdownMenuItem
                        key="export"
                        data-testid="openPartialExportModal"
                        disabled={!canManageRealm}
                        onClick={() => setPartialExportOpen(true)}
                    >
                        <UploadSimple className="size-4 shrink-0" />
                        {t("partialExport")}
                    </DropdownMenuItem>,
                    <DropdownMenuSeparator key="separator" />,
                    <DropdownMenuItem
                        key="delete"
                        disabled={!canManageRealm}
                        onClick={toggleDeleteDialog}
                        className="text-destructive focus:text-destructive"
                    >
                        <Trash className="size-4 shrink-0" />
                        {t("delete")}
                    </DropdownMenuItem>
                ]}
                isEnabled={value}
                isReadOnly={!canManageRealm}
                onToggle={value => {
                    if (!value) {
                        toggleDisableDialog();
                    } else {
                        onChange(value);
                        save();
                    }
                }}
            />
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
            <div className="py-6 px-0 min-w-0">
                {renderContent()}
            </div>
        </FormProvider>
    );
};
