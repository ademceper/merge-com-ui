import type AdminEventRepresentation from "@keycloak/keycloak-admin-client/lib/defs/adminEventRepresentation";
import {
    Action,
    KeycloakDataTable,
    KeycloakSelect,
    ListEmptyState,
    SelectVariant,
    TextControl,
    useFetch
} from "../../shared/keycloak-ui-shared";
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
import { SelectOption } from "../../shared/keycloak-ui-shared";
import { Button } from "@merge/ui/components/button";
import { Input } from "@merge/ui/components/input";
import { Label } from "@merge/ui/components/label";
import { Badge } from "@merge/ui/components/badge";
import { pickBy } from "lodash-es";
import { PropsWithChildren, useMemo, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../admin-client";
import { EventsBanners } from "../Banners";
import DropdownPanel from "../components/dropdown-panel/DropdownPanel";
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
        <Dialog open={true} onOpenChange={open => !open && onClose()}>
            <DialogContent className="max-w-2xl" data-testid={dataTestId}>
                <DialogHeader>
                    <DialogTitle>{t(titleKey)}</DialogTitle>
                </DialogHeader>
                {children}
            </DialogContent>
        </Dialog>
    );
};

const DetailCell = (event: AdminEventRepresentation) => (
    <Table>
        <TableBody>
            {event.details &&
                Object.entries(event.details).map(([key, value]) => (
                    <TableRow key={key}>
                        <TableCell className="font-medium">{key}</TableCell>
                        <TableCell>{String(value)}</TableCell>
                    </TableRow>
                ))}
            {event.error && (
                <TableRow>
                    <TableCell className="font-medium">error</TableCell>
                    <TableCell>{event.error}</TableCell>
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
    const resourceTypes = serverInfo.enums?.["resourceType"];
    const operationTypes = serverInfo.enums?.["operationType"];

    const [key, setKey] = useState(0);
    const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
    const [selectResourceTypesOpen, setSelectResourceTypesOpen] = useState(false);
    const [selectOperationTypesOpen, setSelectOperationTypesOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState<Partial<AdminEventSearchForm>>({});

    const defaultValues: AdminEventSearchForm = {
        resourceTypes: [],
        operationTypes: [],
        resourcePath: resourcePath ? resourcePath : "",
        dateFrom: "",
        dateTo: "",
        authClient: "",
        authUser: "",
        authRealm: "",
        authIpAddress: ""
    };

    const [authEvent, setAuthEvent] = useState<AdminEventRepresentation>();
    const [adminEventsEnabled, setAdminEventsEnabled] = useState<boolean>();
    const [representationEvent, setRepresentationEvent] =
        useState<AdminEventRepresentation>();

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

    const form = useForm<AdminEventSearchForm>({
        mode: "onChange",
        defaultValues
    });
    const {
        getValues,
        reset,
        formState: { isDirty },
        control
    } = form;

    useFetch(
        () => adminClient.realms.getConfigEvents({ realm }),
        events => {
            setAdminEventsEnabled(events?.adminEventsEnabled!);
        },
        []
    );

    function loader(first?: number, max?: number) {
        return adminClient.realms.findAdminEvents({
            resourcePath,
            // The admin client wants 'dateFrom' and 'dateTo' to be Date objects, however it cannot actually handle them so we need to cast to any.
            ...(activeFilters as any),
            realm,
            first,
            max
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

    function removeFilter(key: keyof AdminEventSearchForm) {
        const formValues: AdminEventSearchForm = { ...getValues() };
        delete formValues[key];

        reset({ ...defaultValues, ...formValues });
        commitFilters();
    }

    function removeFilterValue(key: keyof AdminEventSearchForm, valueToRemove: string) {
        const formValues = getValues();
        const fieldValue = formValues[key];
        const newFieldValue = Array.isArray(fieldValue)
            ? fieldValue.filter(val => val !== valueToRemove)
            : fieldValue;

        reset({ ...formValues, [key]: newFieldValue });
        commitFilters();
    }

    function commitFilters() {
        const newFilters: Partial<AdminEventSearchForm> = pickBy(
            getValues(),
            value => value !== "" || (Array.isArray(value) && value.length > 0)
        );

        if (resourcePath) {
            delete newFilters.resourcePath;
        }

        setActiveFilters(newFilters);
        setKey(key + 1);
    }

    const code = useMemo(
        () =>
            representationEvent?.representation
                ? prettyPrintJSON(JSON.parse(representationEvent.representation))
                : "",
        [representationEvent?.representation]
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
                ariaLabelKey="adminEvents"
                toolbarItem={
                    <FormProvider {...form}>
                        <div className="flex flex-col gap-0">
                            <div>
                                <DropdownPanel
                                    buttonText={t("searchForAdminEvent")}
                                    setSearchDropdownOpen={setSearchDropdownOpen}
                                    searchDropdownOpen={searchDropdownOpen}
                                    marginRight="2.5rem"
                                    width="15vw"
                                >
                                    <form
                                        className="keycloak__events_search__form space-y-4"
                                        data-testid="searchForm"
                                    >
                                        <div className="space-y-2 keycloak__events_search__form_label">
                                            <Label htmlFor="kc-resourceTypes">{t("resourceTypes")}</Label>
                                            <div>
                                            <Controller
                                                name="resourceTypes"
                                                control={control}
                                                render={({ field }) => (
                                                    <KeycloakSelect
                                                        className="keycloak__events_search__type_select"
                                                        data-testid="resource-types-searchField"
                                                        chipGroupProps={{
                                                            numChips: 1,
                                                            expandedText: t("hide"),
                                                            collapsedText:
                                                                t("showRemaining")
                                                        }}
                                                        variant={
                                                            SelectVariant.typeaheadMulti
                                                        }
                                                        typeAheadAriaLabel="select-resourceTypes"
                                                        onToggle={isOpen =>
                                                            setSelectResourceTypesOpen(
                                                                isOpen
                                                            )
                                                        }
                                                        selections={field.value}
                                                        onSelect={selectedValue => {
                                                            const option =
                                                                selectedValue.toString();
                                                            const changedValue =
                                                                field.value.includes(
                                                                    option
                                                                )
                                                                    ? field.value.filter(
                                                                          (
                                                                              item: string
                                                                          ) =>
                                                                              item !==
                                                                              option
                                                                      )
                                                                    : [
                                                                          ...field.value,
                                                                          option
                                                                      ];

                                                            field.onChange(changedValue);
                                                        }}
                                                        onClear={() => {
                                                            field.onChange([]);
                                                        }}
                                                        isOpen={selectResourceTypesOpen}
                                                        aria-labelledby={"resourceTypes"}
                                                        chipGroupComponent={
                                                            <div className="flex flex-wrap gap-1">
                                                                {field.value.map(
                                                                    (chip: string) => (
                                                                        <Badge
                                                                            key={chip}
                                                                            variant="secondary"
                                                                            className="cursor-pointer"
                                                                            onClick={e => {
                                                                                e.stopPropagation();
                                                                                field.onChange(
                                                                                    field.value.filter(
                                                                                        (val: string) => val !== chip
                                                                                    )
                                                                                );
                                                                            }}
                                                                        >
                                                                            {chip}
                                                                        </Badge>
                                                                    )
                                                                )}
                                                            </div>
                                                        }
                                                    >
                                                        {resourceTypes?.map(option => (
                                                            <SelectOption
                                                                key={option}
                                                                value={option}
                                                            >
                                                                {option}
                                                            </SelectOption>
                                                        ))}
                                                    </KeycloakSelect>
                                                )}
                                            />
                                            </div>
                                        </div>
                                        <div className="space-y-2 keycloak__events_search__form_label">
                                            <Label htmlFor="kc-operationTypes">{t("operationTypes")}</Label>
                                            <div>
                                            <Controller
                                                name="operationTypes"
                                                control={control}
                                                render={({ field }) => (
                                                    <KeycloakSelect
                                                        className="keycloak__events_search__type_select"
                                                        data-testid="operation-types-searchField"
                                                        chipGroupProps={{
                                                            numChips: 1,
                                                            expandedText: t("hide"),
                                                            collapsedText:
                                                                t("showRemaining")
                                                        }}
                                                        variant={
                                                            SelectVariant.typeaheadMulti
                                                        }
                                                        typeAheadAriaLabel="select-operationTypes"
                                                        onToggle={isOpen =>
                                                            setSelectOperationTypesOpen(
                                                                isOpen
                                                            )
                                                        }
                                                        selections={field.value}
                                                        onSelect={selectedValue => {
                                                            const option =
                                                                selectedValue.toString();
                                                            const changedValue =
                                                                field.value.includes(
                                                                    option
                                                                )
                                                                    ? field.value.filter(
                                                                          (
                                                                              item: string
                                                                          ) =>
                                                                              item !==
                                                                              option
                                                                      )
                                                                    : [
                                                                          ...field.value,
                                                                          option
                                                                      ];

                                                            field.onChange(changedValue);
                                                        }}
                                                        onClear={() => {
                                                            field.onChange([]);
                                                        }}
                                                        isOpen={selectOperationTypesOpen}
                                                        aria-labelledby={"operationTypes"}
                                                        chipGroupComponent={
                                                            <div className="flex flex-wrap gap-1">
                                                                {field.value.map(
                                                                    (chip: string) => (
                                                                        <Badge
                                                                            key={chip}
                                                                            variant="secondary"
                                                                            className="cursor-pointer"
                                                                            onClick={e => {
                                                                                e.stopPropagation();
                                                                                field.onChange(
                                                                                    field.value.filter(
                                                                                        (val: string) => val !== chip
                                                                                    )
                                                                                );
                                                                            }}
                                                                        >
                                                                            {chip}
                                                                        </Badge>
                                                                    )
                                                                )}
                                                            </div>
                                                        }
                                                    >
                                                        {operationTypes?.map(option => (
                                                            <SelectOption
                                                                key={option}
                                                                value={option}
                                                            >
                                                                {option}
                                                            </SelectOption>
                                                        ))}
                                                    </KeycloakSelect>
                                                )}
                                            />
                                            </div>
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
                                        <div className="space-y-2 keycloak__events_search__form_label">
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
                                                        onChange={e =>
                                                            field.onChange(e.target.value)
                                                        }
                                                    />
                                                )}
                                            />
                                        </div>
                                        <div className="space-y-2 keycloak__events_search__form_label">
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
                                                        onChange={e =>
                                                            field.onChange(e.target.value)
                                                        }
                                                    />
                                                )}
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={submitSearch}
                                                data-testid="search-events-btn"
                                                disabled={!isDirty}
                                            >
                                                {t("searchAdminEventsBtn")}
                                            </Button>
                                            <Button
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
                                    <div className="keycloak__searchChips ml-4">
                                        {Object.entries(activeFilters).map(filter => {
                                            const [key, value] = filter as [
                                                keyof AdminEventSearchForm,
                                                string | string[]
                                            ];

                                            if (
                                                key === "resourcePath" &&
                                                !!resourcePath
                                            ) {
                                                return null;
                                            }

                                            return (
                                                <div
                                                    className="flex flex-wrap items-center gap-1 mt-2 mr-2"
                                                    key={key}
                                                >
                                                    <span className="text-sm font-medium">{filterLabels[key]}:</span>
                                                    {typeof value === "string" ? (
                                                        <Badge variant="secondary">{value}</Badge>
                                                    ) : (
                                                        value.map(entry => (
                                                            <Badge
                                                                key={entry}
                                                                variant="secondary"
                                                                className="cursor-pointer"
                                                                onClick={() =>
                                                                    removeFilterValue(
                                                                        key,
                                                                        entry
                                                                    )
                                                                }
                                                            >
                                                                {entry}
                                                            </Badge>
                                                        ))
                                                    )}
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeFilter(key)}
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
                        </div>
                    </FormProvider>
                }
                actions={
                    [
                        {
                            title: t("auth"),
                            onRowClick: event => setAuthEvent(event)
                        },
                        {
                            title: t("representation"),
                            onRowClick: event => setRepresentationEvent(event)
                        }
                    ] as Action<AdminEventRepresentation>[]
                }
                columns={[
                    {
                        name: "time",
                        displayKey: "time",
                        cellRenderer: row =>
                            formatDate(new Date(row.time!), FORMAT_DATE_AND_TIME)
                    },
                    {
                        name: "resourcePath",
                        displayKey: "resourcePath",
                        cellRenderer: CellResourceLinkRenderer
                    },
                    {
                        name: "resourceType",
                        displayKey: "resourceType"
                    },
                    {
                        name: "operationType",
                        displayKey: "operationType"
                    },
                    {
                        name: "",
                        displayKey: "user",
                        cellRenderer: event => event.authDetails?.userId || ""
                    }
                ]}
                emptyState={
                    <ListEmptyState
                        message={t("emptyAdminEvents")}
                        instructions={t("emptyAdminEventsInstructions")}
                        primaryActionText={t("refresh")}
                        onPrimaryAction={() => setKey(key + 1)}
                    />
                }
                isSearching={Object.keys(activeFilters).length > 0}
            />
        </>
    );
};
