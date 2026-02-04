import type ClientProfileRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientProfileRepresentation";
import { getErrorDescription, getErrorMessage, Action,
    KeycloakDataTable,
    KeycloakSpinner,
    ListEmptyState,
    useFetch } from "../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { Button } from "@merge/ui/components/button";
import { Badge } from "@merge/ui/components/badge";
import { Label } from "@merge/ui/components/label";
import { RadioGroup, RadioGroupItem } from "@merge/ui/components/radio-group";
import { Separator } from "@merge/ui/components/separator";
import { omit } from "lodash-es";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAdminClient } from "../admin-client";
import { useConfirmDialog } from "../components/confirm-dialog/ConfirmDialog";
import CodeEditor from "../components/form/CodeEditor";
import { useRealm } from "../context/realm-context/RealmContext";
import { prettyPrintJSON } from "../util";
import { toAddClientProfile } from "./routes/AddClientProfile";
import { toClientProfile } from "./routes/ClientProfile";

type ClientProfile = ClientProfileRepresentation & {
    global: boolean;
};

export default function ProfilesTab() {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const { realm } = useRealm();
const [tableProfiles, setTableProfiles] = useState<ClientProfile[]>();
    const [globalProfiles, setGlobalProfiles] = useState<ClientProfileRepresentation[]>();
    const [selectedProfile, setSelectedProfile] = useState<ClientProfile>();
    const [show, setShow] = useState(false);
    const [code, setCode] = useState<string>();
    const [key, setKey] = useState(0);

    useFetch(
        () =>
            adminClient.clientPolicies.listProfiles({
                includeGlobalProfiles: true
            }),
        allProfiles => {
            setGlobalProfiles(allProfiles.globalProfiles);

            const globalProfiles = allProfiles.globalProfiles?.map(globalProfiles => ({
                ...globalProfiles,
                global: true
            }));

            const profiles = allProfiles.profiles?.map(profiles => ({
                ...profiles,
                global: false
            }));

            const allClientProfiles = globalProfiles?.concat(profiles ?? []);
            setTableProfiles(allClientProfiles || []);
            setCode(JSON.stringify(allClientProfiles, null, 2));
        },
        [key]
    );

    const loader = async () => tableProfiles ?? [];

    const normalizeProfile = (profile: ClientProfile): ClientProfileRepresentation =>
        omit(profile, "global");

    const [toggleDeleteDialog, DeleteConfirm] = useConfirmDialog({
        titleKey: t("deleteClientProfileConfirmTitle"),
        messageKey: t("deleteClientProfileConfirm", {
            profileName: selectedProfile?.name
        }),
        continueButtonLabel: t("delete"),
        continueButtonVariant: "destructive",
        onConfirm: async () => {
            const updatedProfiles = tableProfiles
                ?.filter(
                    profile => profile.name !== selectedProfile?.name && !profile.global
                )
                .map<ClientProfileRepresentation>(profile => normalizeProfile(profile));

            try {
                await adminClient.clientPolicies.createProfiles({
                    profiles: updatedProfiles,
                    globalProfiles
                });
                toast.success(t("deleteClientSuccess"));
                setKey(key + 1);
            } catch (error) {
                toast.error(t("deleteClientError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
            }
        }
    });

    const cellFormatter = (row: ClientProfile) => (
        <Link
            to={toClientProfile({
                realm,
                profileName: row.name!
            })}
            key={row.name}
        >
            {row.name} {row.global && <Badge variant="secondary" className="bg-blue-500/20 text-blue-700 dark:text-blue-300 ml-1">{t("global")}</Badge>}
        </Link>
    );

    if (!tableProfiles) {
        return <KeycloakSpinner />;
    }

    const save = async () => {
        if (!code) {
            return;
        }

        try {
            const obj: ClientProfile[] = JSON.parse(code);
            const changedProfiles = obj
                .filter(profile => !profile.global)
                .map(profile => normalizeProfile(profile));

            const changedGlobalProfiles = obj
                .filter(profile => profile.global)
                .map(profile => normalizeProfile(profile));

            try {
                await adminClient.clientPolicies.createProfiles({
                    profiles: changedProfiles,
                    globalProfiles: changedGlobalProfiles
                });
                toast.success(t("updateClientProfilesSuccess"));
                setKey(key + 1);
            } catch (error) {
                toast.error(t("updateClientProfilesError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
            }
        } catch (error) {
            toast.error(t("invalidJsonClientProfilesError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    return (
        <>
            <DeleteConfirm />
            <section className="py-6">
                <div className="flex flex-wrap items-center gap-4 kc-profiles-config-section">
                    <h1 className="text-lg font-medium">
                        {t("profilesConfigType")}
                    </h1>
                    <RadioGroup value={show ? "json" : "form"} onValueChange={(v) => setShow(v === "json")} className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2 kc-form-radio-btn mr-2 ml-2" data-testid="formView-profilesView">
                            <RadioGroupItem value="form" id="formView-profilesView" />
                            <Label htmlFor="formView-profilesView" className="cursor-pointer">{t("profilesConfigTypes.formView")}</Label>
                        </div>
                        <div className="flex items-center gap-2 kc-editor-radio-btn" data-testid="jsonEditor-profilesView">
                            <RadioGroupItem value="json" id="jsonEditor-profilesView" />
                            <Label htmlFor="jsonEditor-profilesView" className="cursor-pointer">{t("profilesConfigTypes.jsonEditor")}</Label>
                        </div>
                    </RadioGroup>
                </div>
            </section>
            <Separator />
            {!show ? (
                <KeycloakDataTable
                    key={tableProfiles.length}
                    ariaLabelKey="profiles"
                    searchPlaceholderKey="clientProfileSearch"
                    loader={loader}
                    toolbarItem={
                        <div>
                            <Button asChild id="createProfile" data-testid="createProfile">
                                <Link to={toAddClientProfile({ realm, tab: "profiles" })}>
                                    {t("createClientProfile")}
                                </Link>
                            </Button>
                        </div>
                    }
                    isRowDisabled={value => value.global}
                    actions={[
                        {
                            title: t("delete"),
                            onRowClick: profile => {
                                setSelectedProfile(profile);
                                toggleDeleteDialog();
                            }
                        } as Action<ClientProfile>
                    ]}
                    columns={[
                        {
                            name: "name",
                            displayKey: t("name"),
                            cellRenderer: cellFormatter
                        },
                        {
                            name: "description",
                            displayKey: t("clientProfileDescription")
                        }
                    ]}
                    emptyState={
                        <ListEmptyState
                            message={t("emptyClientProfiles")}
                            instructions={t("emptyClientProfilesInstructions")}
                        />
                    }
                />
            ) : (
                <div className="space-y-4">
                    <div className="mt-4 ml-6" id="jsonEditor">
                        <Label className="sr-only">JSON Editor</Label>
                        <CodeEditor
                            value={code}
                            language="json"
                            onChange={value => setCode(value ?? "")}
                            height={480}
                        />
                    </div>
                    <div className="flex gap-2 mt-4 ml-6">
                        <Button onClick={save} data-testid="jsonEditor-saveBtn">
                            {t("save")}
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => setCode(prettyPrintJSON(tableProfiles))}
                            data-testid="jsonEditor-reloadBtn"
                        >
                            {t("reload")}
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
}
