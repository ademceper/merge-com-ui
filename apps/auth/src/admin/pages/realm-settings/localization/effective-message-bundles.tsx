import { DEFAULT_LOCALE, useTranslation } from "@merge-rd/i18n";
import { Badge } from "@merge-rd/ui/components/badge";
import { Button } from "@merge-rd/ui/components/button";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle
} from "@merge-rd/ui/components/empty";
import { FacetedFormFilter } from "@merge-rd/ui/components/faceted-filter/faceted-form-filter";
import { Input } from "@merge-rd/ui/components/input";
import { Label } from "@merge-rd/ui/components/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@merge-rd/ui/components/select";
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
import { MagnifyingGlass, X } from "@phosphor-icons/react";
import { pickBy } from "lodash-es";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FormPanel } from "@/shared/keycloak-ui-shared/scroll-form/form-panel";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import { findEffectiveMessageBundles } from "@/admin/api/realm-settings";
import { useServerInfo } from "@/admin/app/providers/server-info/server-info-provider";
import { useWhoAmI } from "@/admin/app/providers/whoami/who-am-i";
import { useLocaleSort, mapByKey } from "@/admin/shared/lib/use-locale-sort";
import { localeToDisplayName } from "@/admin/shared/lib/util";

type EffectiveMessageBundlesProps = {
    defaultSupportedLocales: string[];
    defaultLocales: string[];
};

type EffectiveMessageBundlesSearchForm = {
    theme: string;
    themeType: string;
    locale: string;
    hasWords: string[];
};

type MessageBundleRow = { key: string; value: string };

const defaultValues: EffectiveMessageBundlesSearchForm = {
    theme: "",
    themeType: "",
    locale: "",
    hasWords: []
};

export const EffectiveMessageBundles = ({
    defaultSupportedLocales,
    defaultLocales
}: EffectiveMessageBundlesProps) => {
    const { t } = useTranslation();
    const { realm } = useRealm();
    const serverInfo = useServerInfo();
    const { whoAmI } = useWhoAmI();
    const localeSort = useLocaleSort();
    const [searchPerformed, setSearchPerformed] = useState(false);
    const [searchResult, setSearchResult] = useState<MessageBundleRow[]>([]);
    const [activeFilters, setActiveFilters] = useState<
        Partial<EffectiveMessageBundlesSearchForm>
    >({});
    const themes = serverInfo.themes;

    const [search, setSearch] = useState("");
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);

    useEffect(() => {
        setCurrentPage(0);
    }, [search, pageSize]);

    const filteredResults = useMemo(() => {
        if (!search) return searchResult;
        const lower = search.toLowerCase();
        return searchResult.filter(r => r.key.toLowerCase().includes(lower));
    }, [searchResult, search]);

    const totalCount = filteredResults.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const paginatedResults = useMemo(() => {
        const start = currentPage * pageSize;
        return filteredResults.slice(start, start + pageSize);
    }, [filteredResults, currentPage, pageSize]);

    const themeTypes = useMemo(() => {
        if (!themes) return [];
        return localeSort(Object.keys(themes), key => key);
    }, [themes, localeSort]);

    const themeNames = useMemo(() => {
        if (!themes) return [];
        return localeSort(
            [
                ...new Set(
                    Object.values(themes as Record<string, { name: string }[]>).flatMap(
                        theme => theme.map(item => item.name)
                    )
                )
            ],
            name => name
        );
    }, [themes, localeSort]);

    const combinedLocales = useMemo(() => {
        return Array.from(
            new Set([...defaultLocales, ...defaultSupportedLocales])
        ).filter(Boolean);
    }, [defaultLocales, defaultSupportedLocales]);

    const filterLabels: Record<keyof EffectiveMessageBundlesSearchForm, string> = {
        theme: t("theme"),
        themeType: t("themeType"),
        locale: t("language"),
        hasWords: t("hasWords")
    };

    const {
        getValues,
        reset,
        formState: { isDirty, isValid },
        control
    } = useForm<EffectiveMessageBundlesSearchForm>({
        mode: "onChange",
        defaultValues
    });

    const runSearchWithFilter = (
        filter: EffectiveMessageBundlesSearchForm = getValues()
    ) => {
        const requiredKeys = ["theme", "themeType", "locale"];
        const hasAll =
            requiredKeys.every(
                k =>
                    (filter[k as keyof EffectiveMessageBundlesSearchForm] ?? "")
                        .toString()
                        .trim() !== ""
            ) &&
            themeNames.includes(filter.theme) &&
            themeTypes.includes(filter.themeType);

        if (!hasAll) {
            setSearchResult([]);
            setSearchPerformed(true);
            return;
        }

        findEffectiveMessageBundles({
                realm,
                theme: filter.theme,
                themeType: filter.themeType,
                locale: filter.locale || DEFAULT_LOCALE,
                source: true
            })
            .then(messages => {
                const filtered =
                    filter.hasWords.length > 0
                        ? messages.filter(m =>
                              filter.hasWords.some(
                                  f => m.value.includes(f) || m.key.includes(f)
                              )
                          )
                        : messages;
                const sorted = localeSort(
                    [...filtered],
                    mapByKey("key")
                ) as MessageBundleRow[];
                setSearchResult(sorted);
                setSearchPerformed(true);
            })
            .catch(() => {
                setSearchResult([]);
                setSearchPerformed(true);
            });
    };

    const runSearch = () => runSearchWithFilter();

    const commitFilters = () => {
        const newFilters = pickBy(
            getValues(),
            value =>
                (typeof value === "string" && value !== "") ||
                (Array.isArray(value) && value.length > 0)
        );
        setActiveFilters(newFilters);
    };

    const submitSearch = () => {
        commitFilters();
        runSearch();
    };

    const resetSearch = () => {
        reset(defaultValues);
        setActiveFilters({});
        setSearchPerformed(false);
        setSearchResult([]);
    };

    const removeFilter = (key: keyof EffectiveMessageBundlesSearchForm) => {
        const formValues = getValues();
        const next = { ...defaultValues, ...formValues };
        delete next[key];
        reset(next);
        setActiveFilters(
            pickBy(
                next,
                v =>
                    (typeof v === "string" && v !== "") ||
                    (Array.isArray(v) && v.length > 0)
            )
        );
        runSearchWithFilter(next);
    };

    const removeFilterValue = (
        key: keyof EffectiveMessageBundlesSearchForm,
        valueToRemove: string
    ) => {
        const formValues = getValues();
        const fieldValue = formValues[key];
        const newFieldValue = Array.isArray(fieldValue)
            ? fieldValue.filter(val => val !== valueToRemove)
            : fieldValue;
        const next = { ...formValues, [key]: newFieldValue };
        reset(next);
        setActiveFilters(
            pickBy(
                next,
                v =>
                    (typeof v === "string" && v !== "") ||
                    (Array.isArray(v) && v.length > 0)
            )
        );
        runSearchWithFilter(next);
    };

    return (
        <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
                {t("effectiveMessageBundlesDescription")}
            </p>

            <FormPanel
                title={t("searchForEffectiveMessageBundles")}
                className="space-y-4"
            >
                <form
                    className="space-y-4"
                    data-testid="effectiveMessageBundlesSearchForm"
                    onSubmit={e => {
                        e.preventDefault();
                        submitSearch();
                    }}
                >
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-2">
                            <Label htmlFor="kc-theme">{t("theme")} *</Label>
                            <Controller
                                name="theme"
                                control={control}
                                rules={{
                                    validate: v =>
                                        (v || "").toString().trim().length > 0 ||
                                        t("required")
                                }}
                                render={({ field }) => (
                                    <Select
                                        value={
                                            field.value
                                                ? field.value
                                                : "__placeholder_theme__"
                                        }
                                        onValueChange={v =>
                                            v !== "__placeholder_theme__" &&
                                            field.onChange(v)
                                        }
                                    >
                                        <SelectTrigger
                                            id="kc-theme"
                                            data-testid="effective_message_bundles-theme-searchField"
                                        >
                                            <SelectValue placeholder={t("selectTheme")} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem
                                                value="__placeholder_theme__"
                                                disabled
                                            >
                                                {t("selectTheme")}
                                            </SelectItem>
                                            {themeNames.map(option => (
                                                <SelectItem key={option} value={option}>
                                                    {option}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="kc-themeType">{t("themeType")} *</Label>
                            <Controller
                                name="themeType"
                                control={control}
                                rules={{
                                    validate: v =>
                                        (v || "").toString().trim().length > 0 ||
                                        t("required")
                                }}
                                render={({ field }) => (
                                    <Select
                                        value={
                                            field.value
                                                ? field.value
                                                : "__placeholder_themeType__"
                                        }
                                        onValueChange={v =>
                                            v !== "__placeholder_themeType__" &&
                                            field.onChange(v)
                                        }
                                    >
                                        <SelectTrigger
                                            id="kc-themeType"
                                            data-testid="effective-message-bundles-feature-searchField"
                                        >
                                            <SelectValue
                                                placeholder={t("selectThemeType")}
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem
                                                value="__placeholder_themeType__"
                                                disabled
                                            >
                                                {t("selectThemeType")}
                                            </SelectItem>
                                            {themeTypes.map(option => (
                                                <SelectItem key={option} value={option}>
                                                    {option}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="kc-language">{t("language")} *</Label>
                            <Controller
                                name="locale"
                                control={control}
                                rules={{
                                    validate: v =>
                                        (v || "").toString().trim().length > 0 ||
                                        t("required")
                                }}
                                render={({ field }) => (
                                    <Select
                                        value={
                                            field.value
                                                ? field.value
                                                : "__placeholder_language__"
                                        }
                                        onValueChange={v =>
                                            v !== "__placeholder_language__" &&
                                            field.onChange(v)
                                        }
                                    >
                                        <SelectTrigger
                                            id="kc-language"
                                            data-testid="effective-message-bundles-language-searchField"
                                        >
                                            <SelectValue
                                                placeholder={t("selectLanguage")}
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem
                                                value="__placeholder_language__"
                                                disabled
                                            >
                                                {t("selectLanguage")}
                                            </SelectItem>
                                            {combinedLocales.map(option => (
                                                <SelectItem key={option} value={option}>
                                                    {localeToDisplayName(
                                                        option,
                                                        whoAmI.locale
                                                    )}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="kc-hasWords">{t("hasWords")}</Label>
                            <Controller
                                name="hasWords"
                                control={control}
                                render={({ field }) => (
                                    <div className="space-y-1">
                                        <Input
                                            id="kc-hasWords"
                                            data-testid="effective-message-bundles-hasWords-searchField"
                                            value={field.value.join(" ")}
                                            onChange={e => {
                                                const input = e.target.value;
                                                if (input.trim().length === 0) {
                                                    field.onChange([]);
                                                } else {
                                                    field.onChange(
                                                        input
                                                            .split(" ")
                                                            .map(word => word.trim())
                                                            .filter(Boolean)
                                                    );
                                                }
                                            }}
                                        />
                                        {field.value.length > 0 && (
                                            <div className="flex flex-wrap gap-1">
                                                {field.value.map(
                                                    (word: string, index: number) => (
                                                        <Badge
                                                            key={`${word}-${index}`}
                                                            variant="secondary"
                                                            className="cursor-pointer"
                                                            onClick={() =>
                                                                field.onChange(
                                                                    field.value.filter(
                                                                        (
                                                                            _: string,
                                                                            i: number
                                                                        ) => i !== index
                                                                    )
                                                                )
                                                            }
                                                        >
                                                            {word}{" "}
                                                            <X className="ml-1 inline size-3" />
                                                        </Badge>
                                                    )
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            type="submit"
                            data-testid="search-effective-message-bundles-btn"
                            disabled={!isValid}
                        >
                            {t("search")}
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={resetSearch}
                            data-testid="reset-search-effective-message-bundles-btn"
                            disabled={!isDirty && !searchPerformed}
                        >
                            {t("reset")}
                        </Button>
                    </div>
                </form>

                {Object.keys(activeFilters).length > 0 && (
                    <div className="flex flex-wrap gap-2 border-t pt-4">
                        {(
                            Object.entries(activeFilters) as [
                                keyof EffectiveMessageBundlesSearchForm,
                                string | string[]
                            ][]
                        ).map(([key, value]) => (
                            <div key={key} className="flex items-center gap-1">
                                <span className="text-muted-foreground text-xs">
                                    {filterLabels[key]}:
                                </span>
                                {typeof value === "string" ? (
                                    <Badge
                                        variant="secondary"
                                        className="cursor-pointer"
                                        onClick={() => removeFilter(key)}
                                    >
                                        {key === "locale"
                                            ? localeToDisplayName(
                                                  value,
                                                  whoAmI.locale
                                              )?.toLowerCase()
                                            : value}
                                        <X className="ml-1 inline size-3" />
                                    </Badge>
                                ) : (
                                    value.map(entry => (
                                        <Badge
                                            variant="secondary"
                                            key={entry}
                                            className="cursor-pointer"
                                            onClick={() => removeFilterValue(key, entry)}
                                        >
                                            {entry} <X className="ml-1 inline size-3" />
                                        </Badge>
                                    ))
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </FormPanel>

            {!searchPerformed && (
                <Empty className="py-12">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <MagnifyingGlass className="size-4" />
                        </EmptyMedia>
                        <EmptyTitle>{t("emptyEffectiveMessageBundles")}</EmptyTitle>
                    </EmptyHeader>
                    <EmptyContent>
                        <EmptyDescription>
                            {t("emptyEffectiveMessageBundlesInstructions")}
                        </EmptyDescription>
                    </EmptyContent>
                </Empty>
            )}

            {searchPerformed && (
                <div className="flex h-full w-full flex-col">
                    <div className="flex items-center justify-between gap-2 py-2.5">
                        <FacetedFormFilter
                            type="text"
                            size="small"
                            title={t("search")}
                            value={search}
                            onChange={value => setSearch(value)}
                            placeholder={t("searchForTranslation")}
                        />
                    </div>

                    <Table className="table-fixed">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50%]">{t("key")}</TableHead>
                                <TableHead className="w-[50%]">{t("value")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedResults.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={2}
                                        className="text-center text-muted-foreground"
                                    >
                                        {t("noSearchResults")}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedResults.map(row => (
                                    <TableRow key={row.key}>
                                        <TableCell className="truncate">
                                            <span className="font-medium">{row.key}</span>
                                        </TableCell>
                                        <TableCell className="truncate">
                                            {row.value}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell colSpan={2} className="p-0">
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
            )}
        </div>
    );
};
