import { Button } from "@merge/ui/components/button";
import { Badge } from "@merge/ui/components/badge";
import { Input } from "@merge/ui/components/input";
import { Label } from "@merge/ui/components/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@merge/ui/components/select";
import { DataTable, type ColumnDef } from "@merge/ui/components/table";
import { FormPanel } from "../../../shared/keycloak-ui-shared/scroll-form/FormPanel";
import { ListEmptyState } from "../../../shared/keycloak-ui-shared";
import { X } from "@phosphor-icons/react";
import { pickBy } from "lodash-es";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../../admin-client";
import { useRealm } from "../../context/realm-context/RealmContext";
import { useServerInfo } from "../../context/server-info/ServerInfoProvider";
import { useWhoAmI } from "../../context/whoami/WhoAmI";
import { DEFAULT_LOCALE } from "../../i18n/i18n";
import { localeToDisplayName } from "../../util";
import useLocaleSort, { mapByKey } from "../../utils/useLocaleSort";

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
    hasWords: [],
};

export const EffectiveMessageBundles = ({
    defaultSupportedLocales,
    defaultLocales,
}: EffectiveMessageBundlesProps) => {
    const { adminClient } = useAdminClient();
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

    const themeTypes = useMemo(() => {
        if (!themes) return [];
        return localeSort(Object.keys(themes), (key) => key);
    }, [themes, localeSort]);

    const themeNames = useMemo(() => {
        if (!themes) return [];
        return localeSort(
            Object.values(themes as Record<string, { name: string }[]>)
                .flatMap((theme) => theme.map((item) => item.name))
                .filter((value, index, self) => self.indexOf(value) === index),
            (name) => name,
        );
    }, [themes, localeSort]);

    const combinedLocales = useMemo(() => {
        return Array.from(
            new Set([...defaultLocales, ...defaultSupportedLocales]),
        ).filter(Boolean);
    }, [defaultLocales, defaultSupportedLocales]);

    const filterLabels: Record<keyof EffectiveMessageBundlesSearchForm, string> =
        {
            theme: t("theme"),
            themeType: t("themeType"),
            locale: t("language"),
            hasWords: t("hasWords"),
        };

    const {
        getValues,
        reset,
        formState: { isDirty, isValid },
        control,
    } = useForm<EffectiveMessageBundlesSearchForm>({
        mode: "onChange",
        defaultValues,
    });

    const runSearchWithFilter = (
        filter: EffectiveMessageBundlesSearchForm = getValues(),
    ) => {
        const requiredKeys = ["theme", "themeType", "locale"];
        const hasAll =
            requiredKeys.every(
                (k) =>
                    (filter[k as keyof EffectiveMessageBundlesSearchForm] ?? "")
                        .toString()
                        .trim() !== "",
            ) &&
            themeNames.includes(filter.theme) &&
            themeTypes.includes(filter.themeType);

        if (!hasAll) {
            setSearchResult([]);
            setSearchPerformed(true);
            return;
        }

        adminClient.serverInfo
            .findEffectiveMessageBundles({
                realm: realm.realm!,
                theme: filter.theme,
                themeType: filter.themeType,
                locale: filter.locale || DEFAULT_LOCALE,
                hasWords: filter.hasWords,
                source: true,
            })
            .then((messages) => {
                const filtered =
                    filter.hasWords.length > 0
                        ? messages.filter((m) =>
                              filter.hasWords.some(
                                  (f) =>
                                      m.value.includes(f) || m.key.includes(f),
                              ),
                          )
                        : messages;
                const sorted = localeSort(
                    [...filtered],
                    mapByKey("key"),
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
            (value) =>
                (typeof value === "string" && value !== "") ||
                (Array.isArray(value) && value.length > 0),
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
        setActiveFilters(pickBy(next, (v) => (typeof v === "string" && v !== "") || (Array.isArray(v) && v.length > 0)));
        runSearchWithFilter(next);
    };

    const removeFilterValue = (
        key: keyof EffectiveMessageBundlesSearchForm,
        valueToRemove: string,
    ) => {
        const formValues = getValues();
        const fieldValue = formValues[key];
        const newFieldValue = Array.isArray(fieldValue)
            ? fieldValue.filter((val) => val !== valueToRemove)
            : fieldValue;
        const next = { ...formValues, [key]: newFieldValue };
        reset(next);
        setActiveFilters(pickBy(next, (v) => (typeof v === "string" && v !== "") || (Array.isArray(v) && v.length > 0)));
        runSearchWithFilter(next);
    };

    const columns: ColumnDef<MessageBundleRow>[] = [
        {
            accessorKey: "key",
            header: t("key"),
            cell: ({ row }) => (
                <span className="font-medium">{row.original.key}</span>
            ),
        },
        {
            accessorKey: "value",
            header: t("value"),
            cell: ({ row }) => row.original.value,
        },
    ];

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
                    onSubmit={(e) => {
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
                                    validate: (v) =>
                                        (v || "").toString().trim().length > 0 ||
                                        t("required"),
                                }}
                                render={({ field }) => (
                                    <Select
                                        value={
                                            field.value
                                                ? field.value
                                                : "__placeholder_theme__"
                                        }
                                        onValueChange={(v) =>
                                            v !== "__placeholder_theme__" &&
                                            field.onChange(v)
                                        }
                                    >
                                        <SelectTrigger
                                            id="kc-theme"
                                            data-testid="effective_message_bundles-theme-searchField"
                                        >
                                            <SelectValue
                                                placeholder={t("selectTheme")}
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem
                                                value="__placeholder_theme__"
                                                disabled
                                            >
                                                {t("selectTheme")}
                                            </SelectItem>
                                            {themeNames.map((option) => (
                                                <SelectItem
                                                    key={option}
                                                    value={option}
                                                >
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
                                    validate: (v) =>
                                        (v || "").toString().trim().length > 0 ||
                                        t("required"),
                                }}
                                render={({ field }) => (
                                    <Select
                                        value={
                                            field.value
                                                ? field.value
                                                : "__placeholder_themeType__"
                                        }
                                        onValueChange={(v) =>
                                            v !== "__placeholder_themeType__" &&
                                            field.onChange(v)
                                        }
                                    >
                                        <SelectTrigger
                                            id="kc-themeType"
                                            data-testid="effective-message-bundles-feature-searchField"
                                        >
                                            <SelectValue
                                                placeholder={t(
                                                    "selectThemeType",
                                                )}
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem
                                                value="__placeholder_themeType__"
                                                disabled
                                            >
                                                {t("selectThemeType")}
                                            </SelectItem>
                                            {themeTypes.map((option) => (
                                                <SelectItem
                                                    key={option}
                                                    value={option}
                                                >
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
                                    validate: (v) =>
                                        (v || "").toString().trim().length > 0 ||
                                        t("required"),
                                }}
                                render={({ field }) => (
                                    <Select
                                        value={
                                            field.value
                                                ? field.value
                                                : "__placeholder_language__"
                                        }
                                        onValueChange={(v) =>
                                            v !== "__placeholder_language__" &&
                                            field.onChange(v)
                                        }
                                    >
                                        <SelectTrigger
                                            id="kc-language"
                                            data-testid="effective-message-bundles-language-searchField"
                                        >
                                            <SelectValue
                                                placeholder={t(
                                                    "selectLanguage",
                                                )}
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem
                                                value="__placeholder_language__"
                                                disabled
                                            >
                                                {t("selectLanguage")}
                                            </SelectItem>
                                            {combinedLocales.map((option) => (
                                                <SelectItem
                                                    key={option}
                                                    value={option}
                                                >
                                                    {localeToDisplayName(
                                                        option,
                                                        whoAmI.locale,
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
                                            onChange={(e) => {
                                                const input = e.target.value;
                                                if (input.trim().length === 0) {
                                                    field.onChange([]);
                                                } else {
                                                    field.onChange(
                                                        input
                                                            .split(" ")
                                                            .map((word) =>
                                                                word.trim(),
                                                            )
                                                            .filter(Boolean),
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
                                                                            i: number,
                                                                        ) =>
                                                                            i !==
                                                                            index,
                                                                    ),
                                                                )
                                                            }
                                                        >
                                                            {word}{" "}
                                                            <X className="ml-1 inline size-3" />
                                                        </Badge>
                                                    ),
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
                                string | string[],
                            ][]
                        ).map(([key, value]) => (
                            <div
                                key={key}
                                className="flex items-center gap-1"
                            >
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
                                                  whoAmI.locale,
                                              )?.toLowerCase()
                                            : value}
                                        <X className="ml-1 inline size-3" />
                                    </Badge>
                                ) : (
                                    value.map((entry) => (
                                        <Badge
                                            variant="secondary"
                                            key={entry}
                                            className="cursor-pointer"
                                            onClick={() =>
                                                removeFilterValue(key, entry)
                                            }
                                        >
                                            {entry}{" "}
                                            <X className="ml-1 inline size-3" />
                                        </Badge>
                                    ))
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </FormPanel>

            {!searchPerformed && (
                <ListEmptyState
                    message={t("emptyEffectiveMessageBundles")}
                    instructions={t("emptyEffectiveMessageBundlesInstructions")}
                    isSearchVariant
                />
            )}

            {searchPerformed && (
                <DataTable
                    columns={columns}
                    data={searchResult}
                    searchColumnId="key"
                    searchPlaceholder={t("searchForTranslation")}
                    emptyMessage={t("noSearchResults")}
                />
            )}
        </div>
    );
};
