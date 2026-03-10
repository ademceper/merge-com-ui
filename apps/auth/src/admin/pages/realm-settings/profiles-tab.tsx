import type ClientProfileRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientProfileRepresentation";
import { useTranslation } from "@merge-rd/i18n";
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
import { Badge } from "@merge-rd/ui/components/badge";
import { Button } from "@merge-rd/ui/components/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@merge-rd/ui/components/dropdown-menu";
import { FacetedFormFilter } from "@merge-rd/ui/components/faceted-filter/faceted-form-filter";
import { Label } from "@merge-rd/ui/components/label";
import { RadioGroup, RadioGroupItem } from "@merge-rd/ui/components/radio-group";
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TablePaginationFooter,
    TableRow
} from "@merge-rd/ui/components/table";
import { DotsThree, Trash } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { omit } from "lodash-es";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
    getErrorDescription,
    getErrorMessage,
    KeycloakSpinner
} from "@/shared/keycloak-ui-shared";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import { useSaveClientProfiles } from "./hooks/use-save-client-profiles";
import {
    toAddClientProfile,
    toClientProfile
} from "@/admin/shared/lib/routes/realm-settings";
import { prettyPrintJSON } from "@/admin/shared/lib/util";
import { CodeEditor } from "@/admin/shared/ui/form/code-editor";
import { useClientProfiles } from "./hooks/use-client-profiles";

type ClientProfile = ClientProfileRepresentation & {
    global: boolean;
};

export function ProfilesTab() {

    const { t } = useTranslation();
    const { realm } = useRealm();
    const [tableProfiles, setTableProfiles] = useState<ClientProfile[]>();
    const [globalProfiles, setGlobalProfiles] = useState<ClientProfileRepresentation[]>();
    const [selectedProfile, setSelectedProfile] = useState<ClientProfile>();
    const [show, setShow] = useState(false);
    const [code, setCode] = useState<string>();

    const { mutateAsync: saveClientProfilesMut } = useSaveClientProfiles();
    const { data: allProfilesData, refetch: refetchProfiles } = useClientProfiles();

    const [search, setSearch] = useState("");
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);

    useEffect(() => {
        setCurrentPage(0);
    }, [search, pageSize]);

    useEffect(() => {
        if (allProfilesData) {
            setGlobalProfiles(allProfilesData.globalProfiles);

            const gProfiles = allProfilesData.globalProfiles?.map(p => ({
                ...p,
                global: true
            }));

            const profiles = allProfilesData.profiles?.map(p => ({
                ...p,
                global: false
            }));

            const allClientProfiles = gProfiles?.concat(profiles ?? []);
            setTableProfiles(allClientProfiles || []);
            setCode(JSON.stringify(allClientProfiles, null, 2));
        }
    }, [allProfilesData]);

    const filteredProfiles = useMemo(() => {
        if (!tableProfiles) return [];
        if (!search) return tableProfiles;
        const lower = search.toLowerCase();
        return tableProfiles.filter(p => p.name?.toLowerCase().includes(lower));
    }, [tableProfiles, search]);

    const totalCount = filteredProfiles.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const paginatedProfiles = useMemo(() => {
        const start = currentPage * pageSize;
        return filteredProfiles.slice(start, start + pageSize);
    }, [filteredProfiles, currentPage, pageSize]);

    const normalizeProfile = (profile: ClientProfile): ClientProfileRepresentation =>
        omit(profile, "global");

    const onDeleteConfirm = async () => {
        if (!selectedProfile) return;
        const updatedProfiles = tableProfiles
            ?.filter(profile => profile.name !== selectedProfile.name && !profile.global)
            .map<ClientProfileRepresentation>(profile => normalizeProfile(profile));

        try {
            await saveClientProfilesMut({
                profiles: updatedProfiles ?? [],
                globalProfiles
            });
            setSelectedProfile(undefined);
            toast.success(t("deleteClientSuccess"));
            refetchProfiles();
        } catch (error) {
            toast.error(t("deleteClientError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        }
    };

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
                await saveClientProfilesMut({
                    profiles: changedProfiles,
                    globalProfiles: changedGlobalProfiles
                });
                toast.success(t("updateClientProfilesSuccess"));
                refetchProfiles();
            } catch (error) {
                toast.error(
                    t("updateClientProfilesError", { error: getErrorMessage(error) }),
                    { description: getErrorDescription(error) }
                );
            }
        } catch (error) {
            toast.error(
                t("invalidJsonClientProfilesError", { error: getErrorMessage(error) }),
                { description: getErrorDescription(error) }
            );
        }
    };

    return (
        <>
            <AlertDialog
                open={!!selectedProfile}
                onOpenChange={open => !open && setSelectedProfile(undefined)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {t("deleteClientProfileConfirmTitle")}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("deleteClientProfileConfirm", {
                                profileName: selectedProfile?.name
                            })}
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
            <div className="flex flex-wrap items-center gap-4 mb-4">
                <h2 className="text-base font-medium">{t("profilesConfigType")}</h2>
                <RadioGroup
                    value={show ? "json" : "form"}
                    onValueChange={v => setShow(v === "json")}
                    className="flex flex-wrap items-center gap-4"
                >
                    <div
                        className="flex items-center gap-2"
                        data-testid="formView-profilesView"
                    >
                        <RadioGroupItem value="form" id="formView-profilesView" />
                        <Label htmlFor="formView-profilesView" className="cursor-pointer">
                            {t("profilesConfigTypes.formView")}
                        </Label>
                    </div>
                    <div
                        className="flex items-center gap-2"
                        data-testid="jsonEditor-profilesView"
                    >
                        <RadioGroupItem value="json" id="jsonEditor-profilesView" />
                        <Label
                            htmlFor="jsonEditor-profilesView"
                            className="cursor-pointer"
                        >
                            {t("profilesConfigTypes.jsonEditor")}
                        </Label>
                    </div>
                </RadioGroup>
            </div>
            {!show ? (
                <div className="flex h-full w-full flex-col">
                    <div className="flex items-center justify-between gap-2 py-2.5">
                        <FacetedFormFilter
                            type="text"
                            size="small"
                            title={t("search")}
                            value={search}
                            onChange={value => setSearch(value)}
                            placeholder={t("clientProfileSearch")}
                        />
                        <Button
                            asChild
                            data-testid="createProfile"
                            variant="default"
                            className="flex h-9 shrink-0 items-center gap-2 px-4 py-2"
                            aria-label={t("createClientProfile")}
                        >
                            <Link
                                to={
                                    toAddClientProfile({
                                        realm,
                                        tab: "profiles"
                                    }) as string
                                }
                            >
                                {t("createClientProfile")}
                            </Link>
                        </Button>
                    </div>

                    <Table className="table-fixed">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[35%]">{t("name")}</TableHead>
                                <TableHead className="w-[55%]">{t("clientProfileDescription")}</TableHead>
                                <TableHead className="w-[10%]" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedProfiles.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={3}
                                        className="text-center text-muted-foreground"
                                    >
                                        {t("emptyClientProfiles")}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedProfiles.map(profile => (
                                    <TableRow key={profile.name}>
                                        <TableCell className="truncate">
                                            <Link
                                                to={
                                                    toClientProfile({
                                                        realm,
                                                        profileName: profile.name!
                                                    }) as string
                                                }
                                                className="text-primary hover:underline"
                                            >
                                                {profile.name}
                                                {profile.global && (
                                                    <Badge
                                                        variant="secondary"
                                                        className="bg-blue-500/20 text-blue-700 dark:text-blue-300 ml-1"
                                                    >
                                                        {t("global")}
                                                    </Badge>
                                                )}
                                            </Link>
                                        </TableCell>
                                        <TableCell className="truncate">
                                            {profile.description ?? "-"}
                                        </TableCell>
                                        <TableCell onClick={e => e.stopPropagation()}>
                                            {profile.global ? null : (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon-sm">
                                                            <DotsThree
                                                                weight="bold"
                                                                className="size-4"
                                                            />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            className="text-destructive focus:text-destructive"
                                                            onClick={() => setSelectedProfile(profile)}
                                                        >
                                                            <Trash className="size-4" />
                                                            {t("delete")}
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell colSpan={3} className="p-0">
                                    <TablePaginationFooter
                                        pageSize={pageSize}
                                        onPageSizeChange={setPageSize}
                                        onPreviousPage={() =>
                                            setCurrentPage(p => Math.max(0, p - 1))
                                        }
                                        onNextPage={() =>
                                            setCurrentPage(p =>
                                                Math.min(totalPages - 1, p + 1)
                                            )
                                        }
                                        hasPreviousPage={currentPage > 0}
                                        hasNextPage={currentPage < totalPages - 1}
                                        totalCount={totalCount}
                                    />
                                </TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
            ) : (
                <div className="space-y-4 pt-4">
                    <div id="jsonEditor">
                        <Label className="sr-only">JSON Editor</Label>
                        <CodeEditor
                            value={code}
                            language="json"
                            onChange={value => setCode(value ?? "")}
                            height={480}
                        />
                    </div>
                    <div className="flex gap-2">
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
