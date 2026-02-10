import type AdminEventRepresentation from "@keycloak/keycloak-admin-client/lib/defs/adminEventRepresentation";
import {
    DataTable,
    DataTableRowActions,
    type ColumnDef
} from "@merge/ui/components/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@merge/ui/components/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@merge/ui/components/table";
import { Button } from "@merge/ui/components/button";
import { Checkbox } from "@merge/ui/components/checkbox";
import { Input } from "@merge/ui/components/input";
import { Label } from "@merge/ui/components/label";
import { Badge } from "@merge/ui/components/badge";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@merge/ui/components/popover";
import { pickBy } from "lodash-es";
import type { PropsWithChildren } from "react";
import { useMemo, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Funnel } from "@phosphor-icons/react";
import { useAdminClient } from "../admin-client";
import { TextControl, useFetch } from "../../shared/keycloak-ui-shared";
import { EventsBanners } from "../Banners";
import CodeEditor from "../components/form/CodeEditor";
import { useRealm } from "../context/realm-context/RealmContext";
import { useServerInfo } from "../context/server-info/ServerInfoProvider";
import { prettyPrintJSON } from "../util";
import useFormatDate, { FORMAT_DATE_AND_TIME } from "../utils/useFormatDate";
import { CellResourceLinkRenderer } from "./ResourceLinks";

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
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl" data-testid={dataTestId}>
                <DialogHeader>
                    <DialogTitle>{t(titleKey)}</DialogTitle>
                </DialogHeader>
                {children}
            </DialogContent>
        </Dialog>
    );
};

const DetailCell = ({ details, error }: { details?: Record<string, unknown>; error?: string }) => (
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
    const { adminClient } = useAdminClient();
    const { t } = useTranslation();
    const { realm } = useRealm();
    const serverInfo = useServerInfo();
    const formatDate = useFormatDate();
    const resourceTypes = serverInfo.enums?.["resourceType"] ?? [];
    const operationTypes = serverInfo.enums?.["operationType"] ?? [];

    const [key, setKey] = useState(0);
    const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
    const [selectResourceTypesOpen, setSelectResourceTypesOpen] = useState(false);
    const [selectOperationTypesOpen, setSelectOperationTypesOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState<Partial<AdminEventSearchForm>>({});
    const [eventList, setEventList] = useState<AdminEventRepresentation[]>([]);
    const [authEvent, setAuthEvent] = useState<AdminEventRepresentation>();
    const [adminEventsEnabled, setAdminEventsEnabled] = useState<boolean>(false);
    const [representationEvent, setRepresentationEvent] = useState<AdminEventRepresentation>();

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
    const { getValues, reset, formState: { isDirty }, control } = form;

    useFetch(
        () => adminClient.realms.getConfigEvents({ realm }),
        (events) => setAdminEventsEnabled(events?.adminEventsEnabled ?? false),
        []
    );

    useFetch(
        () =>
            adminClient.realms.findAdminEvents({
                resourcePath,
                ...(activeFilters as Record<string, unknown>),
                realm,
                first: 0,
                max: 1000
            }),
        (data) => setEventList(data),
        [key, activeFilters]
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

    function removeFilterValue(filterKey: keyof AdminEventSearchForm, valueToRemove: string) {
        const formValues = getValues();
        const fieldValue = formValues[filterKey];
        const newFieldValue = Array.isArray(fieldValue)
            ? fieldValue.filter((val) => val !== valueToRemove)
            : fieldValue;
        reset({ ...formValues, [filterKey]: newFieldValue });
        commitFilters();
    }

    function commitFilters() {
        const newFilters: Partial<AdminEventSearchForm> = pickBy(
            getValues(),
            (value) => value !== "" && (!Array.isArray(value) || value.length > 0)
        );
        if (resourcePath) delete newFilters.resourcePath;
        setActiveFilters(newFilters);
        setKey((k) => k + 1);
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
            cell: ({ row }) => formatDate(new Date(row.original.time!), FORMAT_DATE_AND_TIME)
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

    const searchToolbar = (
        <FormProvider {...form}>
            <div className="flex flex-col gap-0">
                <div className="mr-10">
                    <Popover open={searchDropdownOpen} onOpenChange={setSearchDropdownOpen}>
                        <PopoverTrigger asChild>
                            <button
                                type="button"
                                className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-sm font-medium hover:bg-muted hover:text-foreground dark:border-input dark:hover:bg-input/50"
                                aria-label={t("searchForAdminEvent")}
                                data-testid="dropdown-panel-btn"
                            >
                                <Funnel className="size-4" />
                            </button>
                        </PopoverTrigger>
                        <PopoverContent
                            className="w-[min(90vw,400px)] max-h-[85vh] overflow-auto p-4"
                            align="start"
                            style={{ zIndex: 2147483647 }}
                        >
                            <form className="keycloak__events_search__form space-y-4" data-testid="searchForm">
                            <div className="space-y-2">
                                <Label htmlFor="kc-resourceTypes">{t("resourceTypes")}</Label>
                                <Controller
                                    name="resourceTypes"
                                    control={control}
                                    render={({ field }) => (
                                        <Popover
                                            open={selectResourceTypesOpen}
                                            onOpenChange={setSelectResourceTypesOpen}
                                        >
                                            <PopoverTrigger asChild>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="w-full justify-between h-9 min-h-9"
                                                    data-testid="resource-types-searchField"
                                                >
                                                    {field.value.length === 0
                                                        ? t("select")
                                                        : field.value.length === 1
                                                          ? field.value[0]
                                                          : `${field.value.length} ${t("selected")}`}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-full min-w-[var(--radix-popover-trigger-width)] p-2" align="start">
                                                <div className="max-h-60 overflow-auto space-y-2">
                                                    {resourceTypes.map((option) => (
                                                        <label
                                                            key={option}
                                                            className="flex items-center gap-2 cursor-pointer"
                                                        >
                                                            <Checkbox
                                                                checked={field.value.includes(option)}
                                                                onCheckedChange={(checked) => {
                                                                    const next = checked
                                                                        ? [...field.value, option]
                                                                        : field.value.filter((v) => v !== option);
                                                                    field.onChange(next);
                                                                }}
                                                            />
                                                            {option}
                                                        </label>
                                                    ))}
                                                </div>
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {field.value.map((chip) => (
                                                        <Badge
                                                            key={chip}
                                                            variant="secondary"
                                                            className="cursor-pointer"
                                                            onClick={() =>
                                                                field.onChange(field.value.filter((v) => v !== chip))
                                                            }
                                                        >
                                                            {chip} ×
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    )}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="kc-operationTypes">{t("operationTypes")}</Label>
                                <Controller
                                    name="operationTypes"
                                    control={control}
                                    render={({ field }) => (
                                        <Popover
                                            open={selectOperationTypesOpen}
                                            onOpenChange={setSelectOperationTypesOpen}
                                        >
                                            <PopoverTrigger asChild>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="w-full justify-between h-9 min-h-9"
                                                    data-testid="operation-types-searchField"
                                                >
                                                    {field.value.length === 0
                                                        ? t("select")
                                                        : field.value.length === 1
                                                          ? field.value[0]
                                                          : `${field.value.length} ${t("selected")}`}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-full min-w-[var(--radix-popover-trigger-width)] p-2" align="start">
                                                <div className="max-h-60 overflow-auto space-y-2">
                                                    {operationTypes.map((option) => (
                                                        <label
                                                            key={option}
                                                            className="flex items-center gap-2 cursor-pointer"
                                                        >
                                                            <Checkbox
                                                                checked={field.value.includes(option)}
                                                                onCheckedChange={(checked) => {
                                                                    const next = checked
                                                                        ? [...field.value, option]
                                                                        : field.value.filter((v) => v !== option);
                                                                    field.onChange(next);
                                                                }}
                                                            />
                                                            {option}
                                                        </label>
                                                    ))}
                                                </div>
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {field.value.map((chip) => (
                                                        <Badge
                                                            key={chip}
                                                            variant="secondary"
                                                            className="cursor-pointer"
                                                            onClick={() =>
                                                                field.onChange(field.value.filter((v) => v !== chip))
                                                            }
                                                        >
                                                            {chip} ×
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    )}
                                />
                            </div>
                            {!resourcePath && (
                                <TextControl name="resourcePath" label={t("resourcePath")} />
                            )}
                            <TextControl name="authRealm" label={t("realm")} />
                            <TextControl name="authClient" label={t("client")} />
                            <TextControl name="authUser" label={t("userId")} />
                            <TextControl name="authIpAddress" label={t("ipAddress")} />
                            <div className="space-y-2">
                                <Label htmlFor="kc-dateFrom">{t("dateFrom")}</Label>
                                <Controller
                                    name="dateFrom"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            id="kc-dateFrom"
                                            type="date"
                                            className="w-full h-9"
                                            value={field.value}
                                            onChange={(e) => field.onChange(e.target.value)}
                                        />
                                    )}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="kc-dateTo">{t("dateTo")}</Label>
                                <Controller
                                    name="dateTo"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            id="kc-dateTo"
                                            type="date"
                                            className="w-full h-9"
                                            value={field.value}
                                            onChange={(e) => field.onChange(e.target.value)}
                                        />
                                    )}
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    onClick={submitSearch}
                                    data-testid="search-events-btn"
                                    disabled={!isDirty}
                                >
                                    {t("searchAdminEventsBtn")}
                                </Button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={resetSearch}
                                    disabled={!isDirty}
                                >
                                    {t("resetBtn")}
                                </Button>
                            </div>
                        </form>
                        </PopoverContent>
                    </Popover>
                </div>
                {Object.entries(activeFilters).length > 0 && (
                    <div className="keycloak__searchChips ml-4 mt-2 flex flex-wrap gap-2">
                        {Object.entries(activeFilters).map((filter) => {
                            const [filterKey, value] = filter as [keyof AdminEventSearchForm, string | string[]];
                            if (filterKey === "resourcePath" && !!resourcePath) return null;
                            return (
                                <div className="flex flex-wrap items-center gap-1 mt-2 mr-2" key={filterKey}>
                                    <span className="text-sm font-medium text-muted-foreground">
                                        {filterLabels[filterKey]}:
                                    </span>
                                    {typeof value === "string" ? (
                                        <Badge variant="secondary">{value}</Badge>
                                    ) : (
                                        value.map((entry) => (
                                            <Badge
                                                key={entry}
                                                variant="secondary"
                                                className="cursor-pointer"
                                                onClick={() => removeFilterValue(filterKey, entry)}
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
                key={key}
                columns={columns}
                data={eventList}
                searchColumnId="resourcePath"
                searchPlaceholder={t("resourcePath")}
                emptyMessage={t("emptyAdminEvents")}
                toolbar={searchToolbar}
                getRowCanExpand={(row) => row.original.details !== undefined}
                renderSubRow={(row) => (
                    <DetailCell details={row.original.details} error={row.original.error} />
                )}
            />
        </>
    );
};
