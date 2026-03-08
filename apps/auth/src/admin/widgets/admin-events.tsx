import type AdminEventRepresentation from "@keycloak/keycloak-admin-client/lib/defs/adminEventRepresentation";
import { useTranslation } from "@merge-rd/i18n";
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
import { Funnel } from "@phosphor-icons/react";
import { pickBy } from "lodash-es";
import type { PropsWithChildren } from "react";
import { useEffect, useMemo, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import {
    type ColumnDef,
    DataTable,
    DataTableRowActions,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/admin/shared/ui/data-table";
import { TextControl } from "../../shared/keycloak-ui-shared";
import { MultiSelectField } from "../../shared/keycloak-ui-shared/controls/multi-select-field";
import { useRealm } from "../app/providers/realm-context/realm-context";
import { useServerInfo } from "../app/providers/server-info/server-info-provider";
import { useAdminEvents } from "../pages/events/api/use-admin-events";
import { useEventsConfig } from "../pages/events/api/use-events-config";
import { CellResourceLinkRenderer } from "../pages/events/resource-links";
import useFormatDate, { FORMAT_DATE_AND_TIME } from "../shared/lib/useFormatDate";
import { prettyPrintJSON } from "../shared/lib/util";
import CodeEditor from "../shared/ui/form/code-editor";
import { EventsBanners } from "./banners";

type DisplayDialogProps = PropsWithChildren<{
    titleKey: string;
    onClose: () => void;
    "data-testid"?: string;
}>;

type AdminEventSearchForm = {
    resourceTypes: string[];
    operationTypes: string[];
    resourcePath: string;
    dateFrom: string;
    dateTo: string;
    authClient: string;
    authUser: string;
    authRealm: string;
    authIpAddress: string;
};

const DisplayDialog = ({
    titleKey,
    onClose,
    children,
    "data-testid": dataTestId
}: DisplayDialogProps) => {
    const { t } = useTranslation();
    return (
        <Dialog open onOpenChange={open => !open && onClose()}>
            <DialogContent className="max-w-2xl" data-testid={dataTestId}>
                <DialogHeader>
                    <DialogTitle>{t(titleKey)}</DialogTitle>
                </DialogHeader>
                {children}
            </DialogContent>
        </Dialog>
    );
};

const DetailCell = ({
    details,
    error
}: {
    details?: Record<string, unknown>;
    error?: string;
}) => (
    <Table>
        <TableBody>
            {details &&
                Object.entries(details).map(([key, value]) => (
                    <TableRow key={key}>
                        <TableCell className="font-medium">{key}</TableCell>
                        <TableCell>{String(value)}</TableCell>
                    </TableRow>
                ))}
            {error && (
                <TableRow>
                    <TableCell className="font-medium">error</TableCell>
                    <TableCell>{error}</TableCell>
                </TableRow>
            )}
        </TableBody>
    </Table>
);

type AdminEventsProps = {
    resourcePath?: string;
};

export const AdminEvents = ({ resourcePath }: AdminEventsProps) => {
    const { t } = useTranslation();
    const { realm } = useRealm();
    const serverInfo = useServerInfo();
    const formatDate = useFormatDate();
    const resourceTypes = serverInfo.enums?.resourceType ?? [];
    const operationTypes = serverInfo.enums?.operationType ?? [];

    const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
    const [selectResourceTypesOpen, setSelectResourceTypesOpen] = useState(false);
    const [selectOperationTypesOpen, setSelectOperationTypesOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState<Partial<AdminEventSearchForm>>({});
    const [authEvent, setAuthEvent] = useState<AdminEventRepresentation>();
    const [representationEvent, setRepresentationEvent] =
        useState<AdminEventRepresentation>();

    const defaultValues: AdminEventSearchForm = {
        resourceTypes: [],
        operationTypes: [],
        resourcePath: resourcePath ?? "",
        dateFrom: "",
        dateTo: "",
        authClient: "",
        authUser: "",
        authRealm: "",
        authIpAddress: ""
    };

    const filterLabels: Record<keyof AdminEventSearchForm, string> = {
        resourceTypes: t("resourceTypes"),
        operationTypes: t("operationTypes"),
        resourcePath: t("resourcePath"),
        dateFrom: t("dateFrom"),
        dateTo: t("dateTo"),
        authClient: t("client"),
        authUser: t("userId"),
        authRealm: t("realm"),
        authIpAddress: t("ipAddress")
    };

    const form = useForm<AdminEventSearchForm>({ mode: "onChange", defaultValues });
    const {
        getValues,
        reset,
        formState: { isDirty },
        control
    } = form;

    const { data: eventsConfig } = useEventsConfig();
    const adminEventsEnabled = eventsConfig?.adminEventsEnabled ?? false;

    const { data: eventList = [] } = useAdminEvents(
        activeFilters as Record<string, unknown>,
        resourcePath
    );

    function submitSearch() {
        setSearchDropdownOpen(false);
        commitFilters();
    }

    function resetSearch() {
        reset();
        commitFilters();
    }

    function removeFilter(filterKey: keyof AdminEventSearchForm) {
        const formValues = { ...getValues() };
        delete formValues[filterKey];
        reset({ ...defaultValues, ...formValues });
        commitFilters();
    }

    function removeFilterValue(
        filterKey: keyof AdminEventSearchForm,
        valueToRemove: string
    ) {
        const formValues = getValues();
        const fieldValue = formValues[filterKey];
        const newFieldValue = Array.isArray(fieldValue)
            ? fieldValue.filter(val => val !== valueToRemove)
            : fieldValue;
        reset({ ...formValues, [filterKey]: newFieldValue });
        commitFilters();
    }

    function commitFilters() {
        const newFilters: Partial<AdminEventSearchForm> = pickBy(
            getValues(),
            value => value !== "" && (!Array.isArray(value) || value.length > 0)
        );
        if (resourcePath) delete newFilters.resourcePath;
        setActiveFilters(newFilters);
    }

    const code = useMemo(
        () =>
            representationEvent?.representation
                ? prettyPrintJSON(JSON.parse(representationEvent.representation))
                : "",
        [representationEvent?.representation]
    );

    const columns: ColumnDef<AdminEventRepresentation>[] = [
        {
            accessorKey: "time",
            header: t("time"),
            cell: ({ row }) =>
                formatDate(new Date(row.original.time!), FORMAT_DATE_AND_TIME)
        },
        {
            accessorKey: "resourcePath",
            header: t("resourcePath"),
            cell: ({ row }) => <CellResourceLinkRenderer {...row.original} />
        },
        {
            accessorKey: "resourceType",
            header: t("resourceType")
        },
        {
            accessorKey: "operationType",
            header: t("operationType")
        },
        {
            id: "user",
            header: t("user"),
            cell: ({ row }) => row.original.authDetails?.userId ?? ""
        },
        {
            id: "actions",
            header: "",
            size: 50,
            enableHiding: false,
            cell: ({ row }) => (
                <DataTableRowActions row={row}>
                    <button
                        type="button"
                        className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                        onClick={() => setAuthEvent(row.original)}
                    >
                        {t("auth")}
                    </button>
                    <button
                        type="button"
                        className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                        onClick={() => setRepresentationEvent(row.original)}
                    >
                        {t("representation")}
                    </button>
                </DataTableRowActions>
            )
        }
    ];

    const [isMobile, setIsMobile] = useState<boolean>(
        typeof window !== "undefined" ? window.innerWidth < 640 : false
    );
    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 640);
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    const searchToolbar = (
        <FormProvider {...form}>
            <div className="flex items-center gap-2">
                <div className="flex items-center">
                    {!isMobile ? (
                        <>
                            <button
                                type="button"
                                className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-sm font-medium hover:bg-muted hover:text-foreground dark:border-input dark:hover:bg-input/50"
                                aria-label={t("searchForAdminEvent")}
                                data-testid="dropdown-panel-btn"
                                onClick={() => setSearchDropdownOpen(true)}
                            >
                                <Funnel className="size-4" />
                            </button>
                            {searchDropdownOpen && (
                                <Dialog
                                    open
                                    onOpenChange={open =>
                                        !open && setSearchDropdownOpen(false)
                                    }
                                >
                                    <DialogContent className="max-w-2xl" showCloseButton>
                                        <DialogHeader>
                                            <DialogTitle>
                                                {t("searchAdminEvents")}
                                            </DialogTitle>
                                        </DialogHeader>
                                        <form
                                            className="keycloak__events_search__form space-y-4"
                                            data-testid="searchForm"
                                        >
                                            <div className="space-y-2">
                                                <MultiSelectField
                                                    name="resourceTypes"
                                                    label={t("resourceTypes")}
                                                    options={resourceTypes}
                                                    placeholderText={t("select")}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <MultiSelectField
                                                    name="operationTypes"
                                                    label={t("operationTypes")}
                                                    options={operationTypes}
                                                    placeholderText={t("select")}
                                                />
                                            </div>
                                            {!resourcePath && (
                                                <TextControl
                                                    name="resourcePath"
                                                    label={t("resourcePath")}
                                                />
                                            )}
                                            <TextControl
                                                name="authRealm"
                                                label={t("realm")}
                                            />
                                            <TextControl
                                                name="authClient"
                                                label={t("client")}
                                            />
                                            <TextControl
                                                name="authUser"
                                                label={t("userId")}
                                            />
                                            <TextControl
                                                name="authIpAddress"
                                                label={t("ipAddress")}
                                            />
                                            <div className="space-y-2">
                                                <Label htmlFor="kc-dateFrom">
                                                    {t("dateFrom")}
                                                </Label>
                                                <Controller
                                                    name="dateFrom"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Input
                                                            id="kc-dateFrom"
                                                            type="date"
                                                            className="w-full h-9"
                                                            value={field.value}
                                                            onChange={e =>
                                                                field.onChange(
                                                                    e.target.value
                                                                )
                                                            }
                                                        />
                                                    )}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="kc-dateTo">
                                                    {t("dateTo")}
                                                </Label>
                                                <Controller
                                                    name="dateTo"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Input
                                                            id="kc-dateTo"
                                                            type="date"
                                                            className="w-full h-9"
                                                            value={field.value}
                                                            onChange={e =>
                                                                field.onChange(
                                                                    e.target.value
                                                                )
                                                            }
                                                        />
                                                    )}
                                                />
                                            </div>
                                        </form>
                                        <DialogFooter>
                                            <Button
                                                data-testid="search-events-btn"
                                                disabled={!isDirty}
                                                onClick={() => {
                                                    submitSearch();
                                                }}
                                            >
                                                {t("searchAdminEventsBtn")}
                                            </Button>
                                            <Button variant="ghost" onClick={resetSearch}>
                                                {t("resetBtn")}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </>
                    ) : (
                        <>
                            <button
                                type="button"
                                className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-sm font-medium hover:bg-muted hover:text-foreground dark:border-input dark:hover:bg-input/50"
                                aria-label={t("searchForAdminEvent")}
                                data-testid="dropdown-panel-btn"
                                onClick={() => setSearchDropdownOpen(true)}
                            >
                                <Funnel className="size-4" />
                            </button>
                            {searchDropdownOpen && (
                                <Dialog
                                    open
                                    onOpenChange={open =>
                                        !open && setSearchDropdownOpen(false)
                                    }
                                >
                                    <DialogContent
                                        className="max-w-none w-full h-[90vh]"
                                        showCloseButton
                                    >
                                        <DialogHeader>
                                            <DialogTitle>
                                                {t("searchAdminEvents")}
                                            </DialogTitle>
                                        </DialogHeader>
                                        <form
                                            className="keycloak__events_search__form space-y-4"
                                            data-testid="searchForm"
                                        >
                                            <div className="space-y-2">
                                                <MultiSelectField
                                                    name="resourceTypes"
                                                    label={t("resourceTypes")}
                                                    options={resourceTypes}
                                                    placeholderText={t("select")}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <MultiSelectField
                                                    name="operationTypes"
                                                    label={t("operationTypes")}
                                                    options={operationTypes}
                                                    placeholderText={t("select")}
                                                />
                                            </div>
                                            {!resourcePath && (
                                                <TextControl
                                                    name="resourcePath"
                                                    label={t("resourcePath")}
                                                />
                                            )}
                                            <TextControl
                                                name="authRealm"
                                                label={t("realm")}
                                            />
                                            <TextControl
                                                name="authClient"
                                                label={t("client")}
                                            />
                                            <TextControl
                                                name="authUser"
                                                label={t("userId")}
                                            />
                                            <TextControl
                                                name="authIpAddress"
                                                label={t("ipAddress")}
                                            />
                                            <div className="space-y-2">
                                                <Label htmlFor="kc-dateFrom">
                                                    {t("dateFrom")}
                                                </Label>
                                                <Controller
                                                    name="dateFrom"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Input
                                                            id="kc-dateFrom"
                                                            type="date"
                                                            className="w-full h-9"
                                                            value={field.value}
                                                            onChange={e =>
                                                                field.onChange(
                                                                    e.target.value
                                                                )
                                                            }
                                                        />
                                                    )}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="kc-dateTo">
                                                    {t("dateTo")}
                                                </Label>
                                                <Controller
                                                    name="dateTo"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Input
                                                            id="kc-dateTo"
                                                            type="date"
                                                            className="w-full h-9"
                                                            value={field.value}
                                                            onChange={e =>
                                                                field.onChange(
                                                                    e.target.value
                                                                )
                                                            }
                                                        />
                                                    )}
                                                />
                                            </div>
                                        </form>
                                        <DialogFooter>
                                            <Button
                                                data-testid="search-events-btn"
                                                disabled={!isDirty}
                                                onClick={() => {
                                                    submitSearch();
                                                    setSearchDropdownOpen(false);
                                                }}
                                            >
                                                {t("searchAdminEventsBtn")}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                onClick={() => {
                                                    resetSearch();
                                                }}
                                            >
                                                {t("resetBtn")}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </>
                    )}
                </div>
                {Object.entries(activeFilters).length > 0 && (
                    <div className="keycloak__searchChips ml-0 flex flex-wrap gap-2 items-center">
                        {Object.entries(activeFilters).map(filter => {
                            const [filterKey, value] = filter as [
                                keyof AdminEventSearchForm,
                                string | string[]
                            ];
                            // don't show certain multi-select filters as chips
                            if (filterKey === "resourcePath" && !!resourcePath)
                                return null;
                            if (
                                filterKey === "resourceTypes" ||
                                filterKey === "operationTypes"
                            )
                                return null;
                            return (
                                <div
                                    className="flex items-center gap-1 mr-2"
                                    key={filterKey}
                                >
                                    <span className="text-sm font-medium text-muted-foreground">
                                        {filterLabels[filterKey]}:
                                    </span>
                                    {typeof value === "string" ? (
                                        <Badge variant="secondary">{value}</Badge>
                                    ) : (
                                        value.map(entry => (
                                            <Badge
                                                key={entry}
                                                variant="secondary"
                                                className="cursor-pointer"
                                                onClick={() =>
                                                    removeFilterValue(filterKey, entry)
                                                }
                                            >
                                                {entry} ×
                                            </Badge>
                                        ))
                                    )}
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeFilter(filterKey)}
                                        aria-label={t("removeFilter")}
                                    >
                                        ×
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </FormProvider>
    );

    return (
        <>
            {authEvent && (
                <DisplayDialog titleKey="auth" onClose={() => setAuthEvent(undefined)}>
                    <Table aria-label="authData" data-testid="auth-dialog">
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t("attribute")}</TableHead>
                                <TableHead>{t("value")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell>{t("realm")}</TableCell>
                                <TableCell>{authEvent.authDetails?.realmId}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>{t("client")}</TableCell>
                                <TableCell>{authEvent.authDetails?.clientId}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>{t("user")}</TableCell>
                                <TableCell>{authEvent.authDetails?.userId}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>{t("ipAddress")}</TableCell>
                                <TableCell>{authEvent.authDetails?.ipAddress}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </DisplayDialog>
            )}
            {representationEvent && (
                <DisplayDialog
                    titleKey="representation"
                    data-testid="representation-dialog"
                    onClose={() => setRepresentationEvent(undefined)}
                >
                    <CodeEditor readOnly value={code} language="json" />
                </DisplayDialog>
            )}
            {!adminEventsEnabled && <EventsBanners type="adminEvents" />}
            <DataTable<AdminEventRepresentation>
                columns={columns}
                data={eventList}
                searchColumnId="resourcePath"
                searchPlaceholder={t("resourcePath")}
                emptyMessage={t("emptyAdminEvents")}
                toolbar={searchToolbar}
                getRowCanExpand={row => row.original.details !== undefined}
                renderSubRow={row => (
                    <DetailCell
                        details={row.original.details}
                        error={row.original.error}
                    />
                )}
            />
        </>
    );
};
