import type EventRepresentation from "@keycloak/keycloak-admin-client/lib/defs/eventRepresentation";
import type EventType from "@keycloak/keycloak-admin-client/lib/defs/eventTypes";
import {
    DataTable,
    type ColumnDef
} from "@merge/ui/components/table";
import { Badge } from "@merge/ui/components/badge";
import { Button } from "@merge/ui/components/button";
import { Checkbox } from "@merge/ui/components/checkbox";
import { Input } from "@merge/ui/components/input";
import { Label } from "@merge/ui/components/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@merge/ui/components/popover";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@merge/ui/components/tooltip";
import { CheckCircle, Funnel, Warning } from "@phosphor-icons/react";
import { pickBy } from "lodash-es";
import { useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAdminClient } from "../admin-client";
import { TextControl, useFetch } from "../../shared/keycloak-ui-shared";
import { EventsBanners } from "../Banners";
import { useRealm } from "../context/realm-context/RealmContext";
import { toUser } from "../user/routes/User";
import useFormatDate, { FORMAT_DATE_AND_TIME } from "../utils/useFormatDate";
import useLocaleSort from "../utils/useLocaleSort";

type UserEventSearchForm = {
    client: string;
    dateFrom: string;
    dateTo: string;
    user: string;
    type: EventType[];
    ipAddress: string;
};

const DetailCell = ({ details, error }: { details?: Record<string, string>; error?: string }) => (
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
    const { adminClient } = useAdminClient();
    const { t } = useTranslation();
    const localeSort = useLocaleSort();
    const { realm } = useRealm();
    const formatDate = useFormatDate();
    const [key, setKey] = useState(0);
    const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
    const [selectOpen, setSelectOpen] = useState(false);
    const [events, setEvents] = useState<string[]>();
    const [userEventsEnabled, setUserEventsEnabled] = useState<boolean>();
    const [activeFilters, setActiveFilters] = useState<Partial<UserEventSearchForm>>({});
    const [eventList, setEventList] = useState<EventRepresentation[]>([]);

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

    const { getValues, reset, formState: { isDirty }, control, handleSubmit } = form;

    useFetch(
        () => adminClient.realms.getConfigEvents({ realm }),
        (eventsConfig) => {
            setUserEventsEnabled(eventsConfig?.eventsEnabled ?? false);
            setEvents(localeSort(eventsConfig?.enabledEventTypes || [], (e) => e));
        },
        []
    );

    useFetch(
        () =>
            adminClient.realms.findEvents({
                client,
                user,
                ...(activeFilters as Record<string, unknown>),
                realm,
                first: 0,
                max: 1000
            }),
        (data) => setEventList(data),
        [key, activeFilters]
    );

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

    function removeFilterValue(filterKey: keyof UserEventSearchForm, valueToRemove: EventType) {
        const formValues = getValues();
        const fieldValue = formValues[filterKey];
        const newFieldValue = Array.isArray(fieldValue)
            ? fieldValue.filter((val) => val !== valueToRemove)
            : fieldValue;
        reset({ ...formValues, [filterKey]: newFieldValue });
        commitFilters();
    }

    function commitFilters() {
        const newFilters: Partial<UserEventSearchForm> = pickBy(
            getValues(),
            (value) => value !== "" && (!Array.isArray(value) || value.length > 0)
        );
        if (user) delete newFilters.user;
        if (client) delete newFilters.client;
        setActiveFilters(newFilters);
        setKey((k) => k + 1);
    }

    const columns: ColumnDef<EventRepresentation>[] = [
        {
            accessorKey: "time",
            header: t("time"),
            cell: ({ row }) => formatDate(new Date(row.original.time!), FORMAT_DATE_AND_TIME)
        },
        ...(!user
            ? [
                  {
                      accessorKey: "userId",
                      header: t("userId"),
                      cell: ({ row }) => {
                          const event = row.original;
                          return event.userId ? (
                              <Link
                                  to={toUser({ realm, id: event.userId, tab: "settings" })}
                                  className="text-primary hover:underline"
                              >
                                  {event.userId}
                              </Link>
                          ) : (
                              t("noUserDetails")
                          );
                      }
                  } as ColumnDef<EventRepresentation>
              ]
            : []),
        {
            accessorKey: "type",
            header: t("eventType"),
            cell: ({ row }) => {
                const event = row.original;
                return !event.error ? (
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
                );
            }
        },
        {
            accessorKey: "ipAddress",
            header: t("ipAddress")
        },
        ...(!client
            ? [
                  {
                      accessorKey: "clientId",
                      header: t("client")
                  } as ColumnDef<EventRepresentation>
              ]
            : [])
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
                                        <Popover open={selectOpen} onOpenChange={setSelectOpen}>
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
                                                          ? t(`eventTypes.${field.value[0]}.name`)
                                                          : `${field.value.length} ${t("selected")}`}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-full p-2" align="start">
                                                <div className="max-h-60 overflow-auto space-y-2">
                                                    {events?.map((option) => (
                                                        <label
                                                            key={option}
                                                            className="flex items-center gap-2 cursor-pointer"
                                                        >
                                                            <Checkbox
                                                                checked={field.value.includes(option as EventType)}
                                                                onCheckedChange={(checked) => {
                                                                    const changedValue = checked
                                                                        ? [...field.value, option as EventType]
                                                                        : field.value.filter((v: EventType) => v !== option);
                                                                    field.onChange(changedValue);
                                                                }}
                                                            />
                                                            {t(`eventTypes.${option}.name`)}
                                                        </label>
                                                    ))}
                                                </div>
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {field.value.map((chip: string) => (
                                                        <Badge
                                                            key={chip}
                                                            variant="secondary"
                                                            className="cursor-pointer"
                                                            onClick={() =>
                                                                field.onChange(field.value.filter((v: string) => v !== chip))
                                                            }
                                                        >
                                                            {t(`eventTypes.${chip}.name`)} ×
                                                        </Badge>
                                                    ))}
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
                        {Object.entries(activeFilters).map((filter) => {
                            const [filterKey, value] = filter as [keyof UserEventSearchForm, string | EventType[]];
                            if ((filterKey === "user" && !!user) || (filterKey === "client" && !!client)) return null;
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
            <DataTable<EventRepresentation>
                key={key}
                columns={columns}
                data={eventList}
                searchColumnId="type"
                searchPlaceholder={t("eventType")}
                emptyMessage={t("emptyUserEvents")}
                toolbar={searchToolbar}
                getRowCanExpand={(row) => row.original.details !== undefined}
                renderSubRow={(row) => (
                    <DetailCell details={row.original.details} error={row.original.error} />
                )}
            />
        </>
    );
};
