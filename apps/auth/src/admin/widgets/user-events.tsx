import type EventRepresentation from "@keycloak/keycloak-admin-client/lib/defs/eventRepresentation";
import type EventType from "@keycloak/keycloak-admin-client/lib/defs/eventTypes";
import { useTranslation } from "@merge-rd/i18n";
import { Badge } from "@merge-rd/ui/components/badge";
import { Button } from "@merge-rd/ui/components/button";
import { Checkbox } from "@merge-rd/ui/components/checkbox";
import { Input } from "@merge-rd/ui/components/input";
import { Label } from "@merge-rd/ui/components/label";
import { Popover, PopoverContent, PopoverTrigger } from "@merge-rd/ui/components/popover";
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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from "@merge-rd/ui/components/tooltip";
import { CheckCircle, Funnel, Warning } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { pickBy } from "lodash-es";
import { Fragment, useEffect, useMemo, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { TextControl } from "@/shared/keycloak-ui-shared";
import { useRealm } from "../app/providers/realm-context/realm-context";
import { useEventsConfig } from "../pages/events/hooks/use-events-config";
import { useUserEvents } from "../pages/events/hooks/use-user-events";
import { toUser } from "../shared/lib/routes/user";
import { useFormatDate, FORMAT_DATE_AND_TIME } from "../shared/lib/use-format-date";
import { useLocaleSort } from "../shared/lib/use-locale-sort";
import { EventsBanners } from "./banners";

type UserEventSearchForm = {
    client: string;
    dateFrom: string;
    dateTo: string;
    user: string;
    type: EventType[];
    ipAddress: string;
};

const DetailCell = ({
    details,
    error
}: {
    details?: Record<string, string>;
    error?: string;
}) => (
    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
        {details &&
            Object.entries(details).map(([key, value]) => (
                <span key={key} className="contents">
                    <dt className="font-medium text-muted-foreground">{key}</dt>
                    <dd>{value}</dd>
                </span>
            ))}
        {error && (
            <>
                <dt className="font-medium text-muted-foreground">error</dt>
                <dd>{error}</dd>
            </>
        )}
    </dl>
);

type UserEventsProps = {
    user?: string;
    client?: string;
};

export const UserEvents = ({ user, client }: UserEventsProps) => {
    const { t } = useTranslation();
    const localeSort = useLocaleSort();
    const { realm } = useRealm();
    const formatDate = useFormatDate();
    const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
    const [selectOpen, setSelectOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState<Partial<UserEventSearchForm>>({});
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

    const defaultValues: UserEventSearchForm = {
        client: client ?? "",
        dateFrom: "",
        dateTo: "",
        user: user ?? "",
        type: [],
        ipAddress: ""
    };

    const filterLabels: Record<keyof UserEventSearchForm, string> = {
        client: t("client"),
        dateFrom: t("dateFrom"),
        dateTo: t("dateTo"),
        user: t("userId"),
        type: t("eventType"),
        ipAddress: t("ipAddress")
    };

    const form = useForm<UserEventSearchForm>({
        mode: "onChange",
        defaultValues
    });

    const {
        getValues,
        reset,
        formState: { isDirty },
        control,
        handleSubmit
    } = form;

    const [isMobile, setIsMobile] = useState<boolean>(
        typeof window !== "undefined" ? window.innerWidth < 640 : false
    );
    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 640);
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    const { data: eventsConfig } = useEventsConfig();
    const userEventsEnabled = eventsConfig?.eventsEnabled ?? false;
    const events = useMemo(
        () => localeSort(eventsConfig?.enabledEventTypes || [], e => e),
        [eventsConfig, localeSort]
    );

    const { data: eventList = [] } = useUserEvents(
        activeFilters as Record<string, unknown>,
        user,
        client
    );

    const totalCount = eventList.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const paginatedEvents = useMemo(() => {
        const start = currentPage * pageSize;
        return eventList.slice(start, start + pageSize);
    }, [eventList, currentPage, pageSize]);

    useEffect(() => {
        setCurrentPage(0);
        setExpandedRows(new Set());
    }, [activeFilters, pageSize]);

    const colCount = 3 + (!user ? 1 : 0) + (!client ? 1 : 0);

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

    function onSubmit() {
        setSearchDropdownOpen(false);
        commitFilters();
    }

    function resetSearch() {
        reset();
        commitFilters();
    }

    function removeFilter(filterKey: keyof UserEventSearchForm) {
        const formValues = { ...getValues() };
        delete formValues[filterKey];
        reset({ ...defaultValues, ...formValues });
        commitFilters();
    }

    function removeFilterValue(
        filterKey: keyof UserEventSearchForm,
        valueToRemove: EventType
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
        const newFilters: Partial<UserEventSearchForm> = pickBy(
            getValues(),
            value => value !== "" && (!Array.isArray(value) || value.length > 0)
        );
        if (user) delete newFilters.user;
        if (client) delete newFilters.client;
        setActiveFilters(newFilters);
    }

    const searchToolbar = (
        <FormProvider {...form}>
            <div className="flex flex-col gap-0">
                <div className="mr-0">
                    <Popover
                        open={searchDropdownOpen}
                        onOpenChange={setSearchDropdownOpen}
                    >
                        <PopoverTrigger asChild>
                            <button
                                type="button"
                                className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-sm font-medium hover:bg-muted hover:text-foreground dark:border-input dark:hover:bg-input/50 ml-0"
                                aria-label={t("searchUserEventsBtn")}
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
                            <form
                                data-testid="searchForm"
                                className="keycloak__events_search__form flex flex-col gap-4"
                                onSubmit={handleSubmit(onSubmit)}
                            >
                                {!user && (
                                    <TextControl
                                        name="user"
                                        label={t("userId")}
                                        data-testid="userId-searchField"
                                    />
                                )}
                                <div className="space-y-2">
                                    <Label htmlFor="kc-eventType">{t("eventType")}</Label>
                                    <Controller
                                        name="type"
                                        control={control}
                                        render={({ field }) => (
                                            <Popover
                                                open={selectOpen}
                                                onOpenChange={setSelectOpen}
                                            >
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        className="w-full justify-between h-9 min-h-9"
                                                        data-testid="event-type-searchField"
                                                    >
                                                        {field.value.length === 0
                                                            ? t("select")
                                                            : field.value.length === 1
                                                              ? t(
                                                                    `eventTypes.${field.value[0]}.name`
                                                                )
                                                              : `${field.value.length} ${t("selected")}`}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent
                                                    className="w-full p-2"
                                                    align="start"
                                                >
                                                    <div className="max-h-60 overflow-auto space-y-2">
                                                        {events?.map(option => (
                                                            <label
                                                                key={option}
                                                                className="flex items-center gap-2 cursor-pointer"
                                                            >
                                                                <Checkbox
                                                                    checked={field.value.includes(
                                                                        option as EventType
                                                                    )}
                                                                    onCheckedChange={checked => {
                                                                        const changedValue =
                                                                            checked
                                                                                ? [
                                                                                      ...field.value,
                                                                                      option as EventType
                                                                                  ]
                                                                                : field.value.filter(
                                                                                      (
                                                                                          v: EventType
                                                                                      ) =>
                                                                                          v !==
                                                                                          option
                                                                                  );
                                                                        field.onChange(
                                                                            changedValue
                                                                        );
                                                                    }}
                                                                />
                                                                {t(
                                                                    `eventTypes.${option}.name`
                                                                )}
                                                            </label>
                                                        ))}
                                                    </div>
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {field.value.map(
                                                            (chip: string) => (
                                                                <Badge
                                                                    key={chip}
                                                                    variant="secondary"
                                                                    className="cursor-pointer"
                                                                    onClick={() =>
                                                                        field.onChange(
                                                                            field.value.filter(
                                                                                (
                                                                                    v: string
                                                                                ) =>
                                                                                    v !==
                                                                                    chip
                                                                            )
                                                                        )
                                                                    }
                                                                >
                                                                    {t(
                                                                        `eventTypes.${chip}.name`
                                                                    )}{" "}
                                                                    ×
                                                                </Badge>
                                                            )
                                                        )}
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        )}
                                    />
                                </div>
                                {!client && (
                                    <TextControl
                                        name="client"
                                        label={t("client")}
                                        data-testid="client-searchField"
                                    />
                                )}
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
                                                onChange={e =>
                                                    field.onChange(e.target.value)
                                                }
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
                                                onChange={e =>
                                                    field.onChange(e.target.value)
                                                }
                                            />
                                        )}
                                    />
                                </div>
                                <TextControl
                                    name="ipAddress"
                                    label={t("ipAddress")}
                                    data-testid="ipAddress-searchField"
                                />
                                <div className="flex gap-2">
                                    <Button
                                        data-testid="search-events-btn"
                                        type="submit"
                                        disabled={!isDirty}
                                    >
                                        {t("searchUserEventsBtn")}
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
                        {Object.entries(activeFilters).map(filter => {
                            const [filterKey, value] = filter as [
                                keyof UserEventSearchForm,
                                string | EventType[]
                            ];
                            if (
                                (filterKey === "user" && !!user) ||
                                (filterKey === "client" && !!client)
                            )
                                return null;
                            return (
                                <div
                                    className="flex flex-wrap items-center gap-1 mt-2 mr-2"
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
                                                {t(`eventTypes.${entry}.name`)} ×
                                            </Badge>
                                        ))
                                    )}
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeFilter(filterKey)}
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
            {!userEventsEnabled && <EventsBanners type="userEvents" />}
            <div className="flex h-full w-full flex-col">
                <div className="flex items-center gap-2 py-2.5">
                    {searchToolbar}
                </div>

                <Table className="table-fixed">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[18%]">{t("time")}</TableHead>
                            {!user && (
                                <TableHead className="w-[18%]">{t("userId")}</TableHead>
                            )}
                            <TableHead className="w-[22%]">{t("eventType")}</TableHead>
                            <TableHead className="w-[15%]">{t("ipAddress")}</TableHead>
                            {!client && (
                                <TableHead className="w-[15%]">{t("client")}</TableHead>
                            )}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedEvents.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={colCount}
                                    className="text-center text-muted-foreground"
                                >
                                    {t("emptyUserEvents")}
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedEvents.map((event, index) => {
                                const rowIndex = currentPage * pageSize + index;
                                const canExpand = event.details !== undefined;
                                const isExpanded = expandedRows.has(rowIndex);
                                return (
                                    <Fragment key={rowIndex}>
                                        <TableRow
                                            className={canExpand ? "cursor-pointer" : undefined}
                                            onClick={canExpand ? () => toggleRow(rowIndex) : undefined}
                                        >
                                            <TableCell className="truncate">
                                                {formatDate(new Date(event.time!), FORMAT_DATE_AND_TIME)}
                                            </TableCell>
                                            {!user && (
                                                <TableCell className="truncate" onClick={e => e.stopPropagation()}>
                                                    {event.userId ? (
                                                        <Link
                                                            to={
                                                                toUser({
                                                                    realm,
                                                                    id: event.userId,
                                                                    tab: "settings"
                                                                }) as string
                                                            }
                                                            className="text-primary hover:underline"
                                                        >
                                                            {event.userId}
                                                        </Link>
                                                    ) : (
                                                        t("noUserDetails")
                                                    )}
                                                </TableCell>
                                            )}
                                            <TableCell className="truncate">
                                                {!event.error ? (
                                                    <span className="flex items-center gap-1">
                                                        <CheckCircle className="size-4 text-green-600" />
                                                        {event.type}
                                                    </span>
                                                ) : (
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <span className="flex items-center gap-1 cursor-help">
                                                                    <Warning className="size-4 text-amber-600" />
                                                                    {event.type}
                                                                </span>
                                                            </TooltipTrigger>
                                                            <TooltipContent>{event.error}</TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                )}
                                            </TableCell>
                                            <TableCell className="truncate">
                                                {event.ipAddress}
                                            </TableCell>
                                            {!client && (
                                                <TableCell className="truncate">
                                                    {event.clientId}
                                                </TableCell>
                                            )}
                                        </TableRow>
                                        {isExpanded && (
                                            <TableRow>
                                                <TableCell colSpan={colCount} className="bg-muted/50 p-4">
                                                    <DetailCell
                                                        details={event.details}
                                                        error={event.error}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </Fragment>
                                );
                            })
                        )}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TableCell colSpan={colCount} className="p-0">
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
