import type RealmRepresentation from "@keycloak/keycloak-admin-client/lib/defs/realmRepresentation";
import type {
    PartialImportRealmRepresentation,
    PartialImportResponse,
    PartialImportResult
} from "@keycloak/keycloak-admin-client/lib/defs/realmRepresentation";
import type RoleRepresentation from "@keycloak/keycloak-admin-client/lib/defs/roleRepresentation";
import { KeycloakSelect } from "../../shared/keycloak-ui-shared";
import { Button } from "@merge/ui/components/button";
import { Checkbox } from "@merge/ui/components/checkbox";
import { Badge } from "@merge/ui/components/badge";
import { Separator } from "@merge/ui/components/separator";
import { Label } from "@merge/ui/components/label";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@merge/ui/components/dialog";
import {
    Alert,
    AlertTitle
} from "@merge/ui/components/alert";
import { SelectOption } from "../../shared/keycloak-ui-shared";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../admin-client";
import { getErrorDescription, getErrorMessage } from "../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { JsonFileUpload } from "../components/json-file-upload/JsonFileUpload";
import { DataTable, type ColumnDef } from "@merge/ui/components/table";
import { useRealm } from "../context/realm-context/RealmContext";

export type PartialImportProps = {
    open: boolean;
    toggleDialog: () => void;
};

// An imported JSON file can either be an array of realm objects
// or a single realm object.
type ImportedMultiRealm = RealmRepresentation | RealmRepresentation[];

type NonRoleResource = "users" | "clients" | "groups" | "identityProviders";
type RoleResource = "realmRoles" | "clientRoles";
type Resource = NonRoleResource | RoleResource;

type CollisionOption = "FAIL" | "SKIP" | "OVERWRITE";

type ResourceChecked = { [k in Resource]: boolean };

const INITIAL_RESOURCES: Readonly<ResourceChecked> = {
    users: false,
    clients: false,
    groups: false,
    identityProviders: false,
    realmRoles: false,
    clientRoles: false
};

export const PartialImportDialog = (props: PartialImportProps) => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const { realm } = useRealm();

    const [importedFile, setImportedFile] = useState<ImportedMultiRealm>();
    const isFileSelected = !!importedFile;
    const [isRealmSelectOpen, setIsRealmSelectOpen] = useState(false);
    const [isCollisionSelectOpen, setIsCollisionSelectOpen] = useState(false);
    const [importInProgress, setImportInProgress] = useState(false);
    const [collisionOption, setCollisionOption] = useState<CollisionOption>("FAIL");
    const [targetRealm, setTargetRealm] = useState<RealmRepresentation>({});
    const [importResponse, setImportResponse] = useState<PartialImportResponse>();

    const [resourcesToImport, setResourcesToImport] = useState(INITIAL_RESOURCES);
    const isAnyResourceChecked = Object.values(resourcesToImport).some(
        checked => checked
    );

    const resetResourcesToImport = () => {
        setResourcesToImport(INITIAL_RESOURCES);
    };

    const resetInputState = () => {
        setImportedFile(undefined);
        setTargetRealm({});
        setCollisionOption("FAIL");
        resetResourcesToImport();
    };

    // when dialog opens or closes, clear state
    useEffect(() => {
        setImportInProgress(false);
        setImportResponse(undefined);
        resetInputState();
    }, [props.open]);

    const handleFileChange = (value: ImportedMultiRealm) => {
        resetInputState();
        setImportedFile(value);

        if (!Array.isArray(value)) {
            setTargetRealm(value);
        } else if (value.length > 0) {
            setTargetRealm(value[0]);
        }
    };

    const handleRealmSelect = (realm: string | number | object) => {
        setTargetRealm(realm as RealmRepresentation);
        setIsRealmSelectOpen(false);
        resetResourcesToImport();
    };

    const realmSelectOptions = (realms: RealmRepresentation[]) =>
        realms.map(realm => (
            <SelectOption
                key={realm.id}
                value={realm.realm ?? realm.id ?? ""}
                data-testid={realm.id + "-select-option"}
            >
                {realm.realm || realm.id}
            </SelectOption>
        ));

    const handleCollisionSelect = (option: string | number | object) => {
        setCollisionOption(option as CollisionOption);
        setIsCollisionSelectOpen(false);
    };

    const collisionOptions = () => {
        return [
            <SelectOption key="fail" value="FAIL">
                {t("FAIL")}
            </SelectOption>,
            <SelectOption key="skip" value="SKIP">
                {t("SKIP")}
            </SelectOption>,
            <SelectOption key="overwrite" value="OVERWRITE">
                {t("OVERWRITE")}
            </SelectOption>
        ];
    };

    const targetHasResources = () => {
        return (
            targetHasResource("users") ||
            targetHasResource("groups") ||
            targetHasResource("clients") ||
            targetHasResource("identityProviders") ||
            targetHasRealmRoles() ||
            targetHasClientRoles()
        );
    };

    const targetHasResource = (resource: NonRoleResource) => {
        const value = targetRealm[resource];
        return value !== undefined && value.length > 0;
    };

    const targetHasRealmRoles = () => {
        const value = targetRealm.roles?.realm;
        return value !== undefined && value.length > 0;
    };

    const targetHasClientRoles = () => {
        const value = targetRealm.roles?.client;
        return value !== undefined && Object.keys(value).length > 0;
    };

    const itemCount = (resource: Resource) => {
        if (!isFileSelected) return 0;

        if (resource === "realmRoles") {
            return targetRealm.roles?.realm?.length ?? 0;
        }

        if (resource === "clientRoles") {
            return targetHasClientRoles()
                ? clientRolesCount(targetRealm.roles!.client!)
                : 0;
        }

        return targetRealm[resource]?.length ?? 0;
    };

    const clientRolesCount = (clientRoles: Record<string, RoleRepresentation[]>) =>
        Object.values(clientRoles).reduce((total, role) => total + role.length, 0);

    const resourceDataListItem = (resource: Resource, resourceDisplayName: string) => {
        return (
            <li className="flex items-center gap-2 py-2 px-3" aria-labelledby={`${resource}-list-item`}>
                <Checkbox
                    id={`${resource}-checkbox`}
                    name={resource}
                    checked={resourcesToImport[resource]}
                    onCheckedChange={(checked: boolean) => {
                        setResourcesToImport({
                            ...resourcesToImport,
                            [resource]: checked
                        });
                    }}
                    data-testid={resource + "-checkbox"}
                />
                <Label htmlFor={`${resource}-checkbox`}>{`${itemCount(resource)} ${resourceDisplayName}`}</Label>
            </li>
        );
    };

    const jsonForImport = () => {
        const jsonToImport: PartialImportRealmRepresentation = {
            ifResourceExists: collisionOption,
            id: targetRealm.id,
            realm: targetRealm.realm
        };

        if (resourcesToImport["users"]) jsonToImport.users = targetRealm.users;
        if (resourcesToImport["groups"]) jsonToImport.groups = targetRealm.groups;
        if (resourcesToImport["identityProviders"])
            jsonToImport.identityProviders = targetRealm.identityProviders;
        if (resourcesToImport["clients"]) jsonToImport.clients = targetRealm.clients;
        if (resourcesToImport["realmRoles"] || resourcesToImport["clientRoles"]) {
            jsonToImport.roles = targetRealm.roles;
            if (!resourcesToImport["realmRoles"]) delete jsonToImport.roles?.realm;
            if (!resourcesToImport["clientRoles"]) delete jsonToImport.roles?.client;
        }
        return jsonToImport;
    };

    async function doImport() {
        if (importInProgress) return;

        setImportInProgress(true);

        try {
            const importResults = await adminClient.realms.partialImport({
                realm,
                rep: jsonForImport()
            });
            setImportResponse(importResults);
        } catch (error) {
            toast.error(t("importFail", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }

        setImportInProgress(false);
    }

    const importModal = () => {
        return (
            <Dialog open={props.open} onOpenChange={(open) => { if (!open) props.toggleDialog(); }}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{t("partialImport")}</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">{t("partialImportHeaderText")}</p>
                        </div>
                        <div>
                            <JsonFileUpload
                                id="partial-import-file"
                                allowEditingUploadedText
                                onChange={handleFileChange}
                            />
                        </div>

                        {isFileSelected && targetHasResources() && (
                            <>
                                <Separator />
                                {Array.isArray(importedFile) && importedFile.length > 1 && (
                                    <div>
                                        <p className="text-sm font-medium">{t("selectRealm")}:</p>
                                        <KeycloakSelect
                                            toggleId="realm-selector"
                                            isOpen={isRealmSelectOpen}
                                            typeAheadAriaLabel={t("realmSelector")}
                                            aria-label={t("realmSelector")}
                                            onToggle={() =>
                                                setIsRealmSelectOpen(!isRealmSelectOpen)
                                            }
                                            selections={targetRealm.id}
                                            onSelect={value => handleRealmSelect(value)}
                                            placeholderText={
                                                targetRealm.realm || targetRealm.id
                                            }
                                        >
                                            {realmSelectOptions(importedFile)}
                                        </KeycloakSelect>
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm font-medium">{t("chooseResources")}:</p>
                                    <ul className="divide-y border rounded-md" aria-label={t("resourcesToImport")}>
                                        {targetHasResource("users") &&
                                            resourceDataListItem("users", t("users"))}
                                        {targetHasResource("groups") &&
                                            resourceDataListItem("groups", t("groups"))}
                                        {targetHasResource("clients") &&
                                            resourceDataListItem("clients", t("clients"))}
                                        {targetHasResource("identityProviders") &&
                                            resourceDataListItem(
                                                "identityProviders",
                                                t("identityProviders")
                                            )}
                                        {targetHasRealmRoles() &&
                                            resourceDataListItem(
                                                "realmRoles",
                                                t("realmRoles")
                                            )}
                                        {targetHasClientRoles() &&
                                            resourceDataListItem(
                                                "clientRoles",
                                                t("clientRoles")
                                            )}
                                    </ul>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{t("selectIfResourceExists")}:</p>
                                    <KeycloakSelect
                                        isOpen={isCollisionSelectOpen}
                                        direction="up"
                                        onToggle={() => {
                                            setIsCollisionSelectOpen(!isCollisionSelectOpen);
                                        }}
                                        selections={collisionOption}
                                        onSelect={handleCollisionSelect}
                                        placeholderText={t(collisionOption)}
                                    >
                                        {collisionOptions()}
                                    </KeycloakSelect>
                                </div>
                            </>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            id="modal-import"
                            data-testid="confirm"
                            disabled={!isAnyResourceChecked}
                            onClick={async () => {
                                await doImport();
                            }}
                        >
                            {t("import")}
                        </Button>
                        <Button
                            id="modal-cancel"
                            data-testid="cancel"
                            variant="ghost"
                            onClick={() => {
                                props.toggleDialog();
                            }}
                        >
                            {t("cancel")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    };

    const importCompleteMessage = () => {
        return `${t("importAdded", {
            count: importResponse?.added
        })}  ${t("importSkipped", {
            count: importResponse?.skipped
        })} ${t("importOverwritten", {
            count: importResponse?.overwritten
        })}`;
    };

    const typeMap = new Map([
        ["CLIENT", t("clients")],
        ["REALM_ROLE", t("realmRoles")],
        ["USER", t("users")],
        ["CLIENT_ROLE", t("clientRoles")],
        ["IDP", t("identityProviders")],
        ["GROUP", t("groups")]
    ]);

    const partialImportColumns: ColumnDef<PartialImportResult>[] = [
        {
            accessorKey: "action",
            header: t("action"),
            cell: ({ row }) => {
                const action = row.original.action;
                if (action === "ADDED") return <Badge variant="secondary" className="bg-green-500/20 text-green-700">{t("added")}</Badge>;
                if (action === "SKIPPED") return <Badge variant="secondary" className="bg-orange-500/20 text-orange-700">{t("skipped")}</Badge>;
                if (action === "OVERWRITTEN") return <Badge variant="secondary" className="bg-purple-500/20 text-purple-700">{t("overwritten")}</Badge>;
                return null;
            }
        },
        {
            accessorKey: "resourceType",
            header: t("type"),
            cell: ({ row }) => <span>{typeMap.get(row.original.resourceType)}</span>
        },
        { accessorKey: "resourceName", header: t("name") },
        { accessorKey: "id", header: t("id") }
    ];

    const importCompletedModal = () => {
        return (
            <Dialog open={props.open} onOpenChange={(open) => { if (!open) props.toggleDialog(); }}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{t("partialImport")}</DialogTitle>
                    </DialogHeader>
                    <Alert>
                        <AlertTitle>{importCompleteMessage()}</AlertTitle>
                    </Alert>
                    <DataTable<PartialImportResult>
                        columns={partialImportColumns}
                        data={importResponse?.results ?? []}
                        emptyMessage={t("noResults")}
                    />
                    <DialogFooter>
                        <Button id="modal-close" data-testid="close-button" onClick={() => props.toggleDialog()}>
                            {t("close")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    };

    if (!importResponse) {
        return importModal();
    }

    return importCompletedModal();
};
