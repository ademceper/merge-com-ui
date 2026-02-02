/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/events/UserEvents.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import type EventRepresentation from "@keycloak/keycloak-admin-client/lib/defs/eventRepresentation";
import type EventType from "@keycloak/keycloak-admin-client/lib/defs/eventTypes";
import {
    KeycloakDataTable,
    ListEmptyState,
    TextControl,
    useFetch
} from "../../shared/keycloak-ui-shared";
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
import { CheckCircle, Warning } from "@phosphor-icons/react";
import { pickBy } from "lodash-es";
import { useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAdminClient } from "../admin-client";
import { EventsBanners } from "../Banners";
import DropdownPanel from "../components/dropdown-panel/DropdownPanel";
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

const StatusRow = (event: EventRepresentation) =>
    !event.error ? (
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

const DetailCell = (event: EventRepresentation) => (
    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 keycloak_eventsection_details">
        {event.details &&
            Object.entries(event.details).map(([key, value]) => (
                <span key={key} className="contents">
                    <dt className="font-medium text-muted-foreground">{key}</dt>
                    <dd>{value}</dd>
                </span>
            ))}
        {event.error && (
            <>
                <dt className="font-medium text-muted-foreground">error</dt>
                <dd>{event.error}</dd>
            </>
        )}
    </dl>
);

const UserDetailLink = (event: EventRepresentation) => {
    const { t } = useTranslation();
    const { realm } = useRealm();

    return (
        <>
            {event.userId && (
                <Link
                    key={`link-${event.time}-${event.type}`}
                    to={toUser({
                        realm,
                        id: event.userId,
                        tab: "settings"
                    })}
                >
                    {event.userId}
                </Link>
            )}
            {!event.userId && t("noUserDetails")}
        </>
    );
};

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

    const defaultValues: UserEventSearchForm = {
        client: client ? client : "",
        dateFrom: "",
        dateTo: "",
        user: user ? user : "",
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

    useFetch(
        () => adminClient.realms.getConfigEvents({ realm }),
        events => {
            setUserEventsEnabled(events?.eventsEnabled!);
            setEvents(localeSort(events?.enabledEventTypes || [], e => e));
        },
        []
    );

    function loader(first?: number, max?: number) {
        return adminClient.realms.findEvents({
            client,
            user,
            // The admin client wants 'dateFrom' and 'dateTo' to be Date objects, however it cannot actually handle them so we need to cast to any.
            ...(activeFilters as any),
            realm,
            first,
            max
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

    function removeFilter(key: keyof UserEventSearchForm) {
        const formValues: UserEventSearchForm = { ...getValues() };
        delete formValues[key];

        reset({ ...defaultValues, ...formValues });
        commitFilters();
    }

    function removeFilterValue(key: keyof UserEventSearchForm, valueToRemove: EventType) {
        const formValues = getValues();
        const fieldValue = formValues[key];
        const newFieldValue = Array.isArray(fieldValue)
            ? fieldValue.filter(val => val !== valueToRemove)
            : fieldValue;

        reset({ ...formValues, [key]: newFieldValue });
        commitFilters();
    }

    function commitFilters() {
        const newFilters: Partial<UserEventSearchForm> = pickBy(
            getValues(),
            value => value !== "" || (Array.isArray(value) && value.length > 0)
        );

        if (user) {
            delete newFilters.user;
        }

        if (client) {
            delete newFilters.client;
        }

        setActiveFilters(newFilters);
        setKey(key + 1);
    }

    const userEventSearchFormDisplay = () => {
        return (
            <FormProvider {...form}>
                <div className="flex flex-col gap-0">
                    <div>
                        <DropdownPanel
                            buttonText={t("searchUserEventsBtn")}
                            setSearchDropdownOpen={setSearchDropdownOpen}
                            searchDropdownOpen={searchDropdownOpen}
                            marginRight="2.5rem"
                            width="15vw"
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
                                                        className="w-full justify-between"
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
                                                        {events?.map(option => (
                                                            <label
                                                                key={option}
                                                                className="flex items-center gap-2 cursor-pointer"
                                                            >
                                                                <Checkbox
                                                                    checked={field.value.includes(option)}
                                                                    onCheckedChange={checked => {
                                                                        const changedValue = checked
                                                                            ? [...field.value, option]
                                                                            : field.value.filter((v: string) => v !== option);
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
                                                className="w-full"
                                                value={field.value}
                                                onChange={e => field.onChange(e.target.value)}
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
                                                className="w-full"
                                                value={field.value}
                                                onChange={e => field.onChange(e.target.value)}
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
                        </DropdownPanel>
                    </div>
                    <div>
                        {Object.entries(activeFilters).length > 0 && (
                            <div className="keycloak__searchChips ml-4 mt-2 flex flex-wrap gap-2">
                                {Object.entries(activeFilters).map(filter => {
                                    const [key, value] = filter as [
                                        keyof UserEventSearchForm,
                                        string | EventType[]
                                    ];

                                    if (
                                        (key === "user" && !!user) ||
                                        (key === "client" && !!client)
                                    ) {
                                        return null;
                                    }

                                    return (
                                        <div
                                            className="flex flex-wrap items-center gap-1 mt-2 mr-2"
                                            key={key}
                                        >
                                            <span className="text-sm font-medium text-muted-foreground">
                                                {filterLabels[key]}:
                                            </span>
                                            {typeof value === "string" ? (
                                                <Badge variant="secondary">{value}</Badge>
                                            ) : (
                                                value.map(entry => (
                                                    <Badge
                                                        key={entry}
                                                        variant="secondary"
                                                        className="cursor-pointer"
                                                        onClick={() => removeFilterValue(key, entry)}
                                                    >
                                                        {t(`eventTypes.${entry}.name`)} ×
                                                    </Badge>
                                                ))
                                            )}
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeFilter(key)}
                                            >
                                                ×
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </FormProvider>
        );
    };

    return (
        <>
            {!userEventsEnabled && <EventsBanners type="userEvents" />}
            <KeycloakDataTable
                key={key}
                loader={loader}
                detailColumns={[
                    {
                        name: "details",
                        enabled: event => event.details !== undefined,
                        cellRenderer: DetailCell
                    }
                ]}
                isPaginated
                ariaLabelKey="titleEvents"
                toolbarItem={userEventSearchFormDisplay()}
                columns={[
                    {
                        name: "time",
                        displayKey: "time",
                        cellRenderer: row =>
                            formatDate(new Date(row.time!), FORMAT_DATE_AND_TIME)
                    },
                    ...(!user
                        ? [
                              {
                                  name: "userId",
                                  cellRenderer: UserDetailLink
                              }
                          ]
                        : []),
                    {
                        name: "type",
                        displayKey: "eventType",
                        cellRenderer: StatusRow
                    },
                    {
                        name: "ipAddress",
                        displayKey: "ipAddress"
                    },
                    ...(!client
                        ? [
                              {
                                  name: "clientId",
                                  displayKey: "client"
                              }
                          ]
                        : [])
                ]}
                emptyState={
                    <ListEmptyState
                        message={t("emptyUserEvents")}
                        instructions={t("emptyUserEventsInstructions")}
                        primaryActionText={t("refresh")}
                        onPrimaryAction={() => setKey(key + 1)}
                    />
                }
                isSearching={Object.keys(activeFilters).length > 0}
            />
        </>
    );
};
