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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@merge-rd/ui/components/dropdown-menu";
import { Input } from "@merge-rd/ui/components/input";
import { Label } from "@merge-rd/ui/components/label";
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
import { DotsThree, Funnel } from "@phosphor-icons/react";
import { pickBy } from "lodash-es";
import type { PropsWithChildren } from "react";
import { useEffect, useMemo, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { TextControl } from "@/shared/keycloak-ui-shared";
import { MultiSelectField } from "@/shared/keycloak-ui-shared/controls/multi-select-field";
import { useRealm } from "../app/providers/realm-context/realm-context";
import { useServerInfo } from "../app/providers/server-info/server-info-provider";
import { useAdminEvents } from "../pages/events/hooks/use-admin-events";
import { useEventsConfig } from "../pages/events/hooks/use-events-config";
import { CellResourceLinkRenderer } from "../pages/events/resource-links";
import { useFormatDate, FORMAT_DATE_AND_TIME } from "../shared/lib/use-format-date";
import { prettyPrintJSON } from "../shared/lib/util";
import { CodeEditor } from "../shared/ui/form/code-editor";
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
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);

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

    const totalCount = eventList.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const paginatedEvents = useMemo(() => {
        const start = currentPage * pageSize;
        return eventList.slice(start, start + pageSize);
    }, [eventList, currentPage, pageSize]);

    useEffect(() => {
        setCurrentPage(0);
    }, [pageSize]);

    function toggleRow(index: number) {
        setExpandedRows(prev => {
            const next = new Set(prev);
            if (next.has(index)) {
                next.delete(index);
            } else {
                next.add(index);
            }
            return next;
        });
    }

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

    const colSpan = 6;

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
            <div className="flex h-full w-full flex-col">
                <div className="flex items-center justify-between gap-2 py-2.5">
                    {searchToolbar}
                </div>

                <Table className="table-fixed">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[15%]">{t("time")}</TableHead>
                            <TableHead className="w-[20%]">
                                {t("resourcePath")}
                            </TableHead>
                            <TableHead className="w-[15%]">
                                {t("resourceType")}
                            </TableHead>
                            <TableHead className="w-[15%]">
                                {t("operationType")}
                            </TableHead>
                            <TableHead className="w-[15%]">{t("user")}</TableHead>
                            <TableHead className="w-[10%]" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedEvents.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={colSpan}
                                    className="text-center text-muted-foreground"
                                >
                                    {t("emptyAdminEvents")}
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedEvents.map((event, index) => {
                                const globalIndex = currentPage * pageSize + index;
                                const hasDetails = event.details !== undefined;
                                const isExpanded = expandedRows.has(globalIndex);
                                return (
                                    <>
                                        <TableRow
                                            key={`row-${globalIndex}`}
                                            className={
                                                hasDetails ? "cursor-pointer" : undefined
                                            }
                                            onClick={() =>
                                                hasDetails && toggleRow(globalIndex)
                                            }
                                        >
                                            <TableCell className="truncate">
                                                {formatDate(
                                                    new Date(event.time!),
                                                    FORMAT_DATE_AND_TIME
                                                )}
                                            </TableCell>
                                            <TableCell className="truncate">
                                                <CellResourceLinkRenderer {...event} />
                                            </TableCell>
                                            <TableCell className="truncate">
                                                {event.resourceType}
                                            </TableCell>
                                            <TableCell className="truncate">
                                                {event.operationType}
                                            </TableCell>
                                            <TableCell className="truncate">
                                                {event.authDetails?.userId ?? ""}
                                            </TableCell>
                                            <TableCell
                                                onClick={e => e.stopPropagation()}
                                            >
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon-sm"
                                                        >
                                                            <DotsThree
                                                                weight="bold"
                                                                className="size-4"
                                                            />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                setAuthEvent(event)
                                                            }
                                                        >
                                                            {t("auth")}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                setRepresentationEvent(
                                                                    event
                                                                )
                                                            }
                                                        >
                                                            {t("representation")}
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                        {isExpanded && (
                                            <TableRow key={`detail-${globalIndex}`}>
                                                <TableCell colSpan={colSpan}>
                                                    <DetailCell
                                                        details={event.details}
                                                        error={event.error}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </>
                                );
                            })
                        )}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TableCell colSpan={colSpan} className="p-0">
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
        </>
    );
};
