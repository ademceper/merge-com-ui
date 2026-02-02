/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/realm-settings/localization/EffectiveMessageBundles.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { KeycloakSelect, SelectVariant } from "../../../shared/keycloak-ui-shared";
import { Button } from "@merge/ui/components/button";
import { Badge } from "@merge/ui/components/badge";
import { Input } from "@merge/ui/components/input";
import { Label } from "@merge/ui/components/label";
import { Separator } from "@merge/ui/components/separator";
import { X } from "@phosphor-icons/react";
import { SelectOption } from "../../../shared/@patternfly/react-core";
import { pickBy } from "lodash-es";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../../admin-client";
import DropdownPanel from "../../components/dropdown-panel/DropdownPanel";
import { ListEmptyState } from "../../../shared/keycloak-ui-shared";
import { KeycloakDataTable } from "../../../shared/keycloak-ui-shared";
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
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const { realm } = useRealm();
    const serverInfo = useServerInfo();
    const { whoAmI } = useWhoAmI();
    const localeSort = useLocaleSort();
    const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
    const [searchPerformed, setSearchPerformed] = useState(false);
    const [selectThemesOpen, setSelectThemesOpen] = useState(false);
    const [selectThemeTypeOpen, setSelectThemeTypeOpen] = useState(false);
    const [selectLanguageOpen, setSelectLanguageOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState<
        Partial<EffectiveMessageBundlesSearchForm>
    >({});
    const [key, setKey] = useState(0);
    const themes = serverInfo.themes;

    const themeTypes = useMemo(() => {
        if (!themes) {
            return [];
        }

        return localeSort(Object.keys(themes), key => key);
    }, [themes]);

    const themeNames = useMemo(() => {
        if (!themes) {
            return [];
        }

        return localeSort(
            Object.values(themes as Record<string, { name: string }[]>)
                .flatMap(theme => theme.map(item => item.name))
                .filter((value, index, self) => self.indexOf(value) === index),
            name => name
        );
    }, [themes]);

    const combinedLocales = useMemo(() => {
        return Array.from(new Set([...defaultLocales, ...defaultSupportedLocales]));
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

    const loader = async () => {
        try {
            const filter = getValues();

            const requiredKeys = ["theme", "themeType", "locale"];
            const shouldReturnEmpty = requiredKeys.some(
                key => !filter[key as keyof EffectiveMessageBundlesSearchForm]
            );

            if (shouldReturnEmpty) {
                return [];
            }

            const messages = await adminClient.serverInfo.findEffectiveMessageBundles({
                realm,
                ...filter,
                locale: filter.locale || DEFAULT_LOCALE,
                source: true
            });

            const filteredMessages =
                filter.hasWords.length > 0
                    ? messages.filter(m =>
                          filter.hasWords.some(
                              f => m.value.includes(f) || m.key.includes(f)
                          )
                      )
                    : messages;

            const sortedMessages = localeSort([...filteredMessages], mapByKey("key"));

            return sortedMessages;
        } catch {
            return [];
        }
    };

    function submitSearch() {
        setSearchDropdownOpen(false);
        commitFilters();
    }

    function resetSearch() {
        reset();
        commitFilters();
    }

    function removeFilter(key: keyof EffectiveMessageBundlesSearchForm) {
        const formValues: EffectiveMessageBundlesSearchForm = { ...getValues() };
        delete formValues[key];

        reset({ ...defaultValues, ...formValues });
        commitFilters();
    }

    function removeFilterValue(
        key: keyof EffectiveMessageBundlesSearchForm,
        valueToRemove: string
    ) {
        const formValues = getValues();
        const fieldValue = formValues[key];
        const newFieldValue = Array.isArray(fieldValue)
            ? fieldValue.filter(val => val !== valueToRemove)
            : fieldValue;

        reset({ ...formValues, [key]: newFieldValue });
        commitFilters();
    }

    function commitFilters() {
        const newFilters: Partial<EffectiveMessageBundlesSearchForm> = pickBy(
            getValues(),
            value => value !== "" || (Array.isArray(value) && value.length > 0)
        );

        setActiveFilters(newFilters);
        setKey(key + 1);
    }

    const effectiveMessageBunldesSearchFormDisplay = () => {
        return (
            <div className="flex flex-col">
                <div>
                    <p className="mb-4 mt-0 mr-4 text-sm text-muted-foreground">
                        {t("effectiveMessageBundlesDescription")}
                    </p>
                </div>
                <div>
                    <DropdownPanel
                        buttonText={t("searchForEffectiveMessageBundles")}
                        setSearchDropdownOpen={setSearchDropdownOpen}
                        searchDropdownOpen={searchDropdownOpen}
                        marginRight="2.5rem"
                        width="15vw"
                    >
                        <form
                            className="w-[25vw]"
                            data-testid="effectiveMessageBundlesSearchForm"
                            onSubmit={e => e.preventDefault()}
                        >
                            <div className="space-y-2">
                                <Label htmlFor="kc-theme">{t("theme")} *</Label>
                                <Controller
                                    name="theme"
                                    control={control}
                                    defaultValue=""
                                    rules={{
                                        validate: value => (value || "").length > 0
                                    }}
                                    render={({ field }) => (
                                        <KeycloakSelect
                                            data-testid="effective_message_bundles-theme-searchField"
                                            chipGroupProps={{
                                                numChips: 1,
                                                expandedText: t("hide"),
                                                collapsedText: t("showRemaining")
                                            }}
                                            variant={SelectVariant.single}
                                            typeAheadAriaLabel="Select"
                                            onToggle={val => setSelectThemesOpen(val)}
                                            selections={field.value}
                                            onSelect={selectedValue => {
                                                field.onChange(selectedValue.toString());
                                                setSelectThemesOpen(false);
                                            }}
                                            onClear={() => {
                                                field.onChange("");
                                            }}
                                            isOpen={selectThemesOpen}
                                            aria-label={t("selectTheme")}
                                            chipGroupComponent={
                                                <div className="flex flex-wrap gap-1">
                                                    <Badge variant="secondary" className="cursor-pointer" key={field.value} onClick={(e) => { e.stopPropagation(); field.onChange(""); }}>
                                                        {field.value} <X className="size-3 ml-1 inline" />
                                                    </Badge>
                                                </div>
                                            }
                                        >
                                            {[
                                                <SelectOption
                                                    key="theme_placeholder"
                                                    label={t("selectTheme")}
                                                    isDisabled
                                                >
                                                    {t("selectTheme")}
                                                </SelectOption>
                                            ].concat(
                                                themeNames.map(option => (
                                                    <SelectOption
                                                        key={option}
                                                        value={option}
                                                    >
                                                        {option}
                                                    </SelectOption>
                                                ))
                                            )}
                                        </KeycloakSelect>
                                    )}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="kc-themeType">{t("themeType")} *</Label>
                                <Controller
                                    name="themeType"
                                    control={control}
                                    defaultValue=""
                                    rules={{
                                        validate: value => (value || "").length > 0
                                    }}
                                    render={({ field }) => (
                                        <KeycloakSelect
                                            data-testid="effective-message-bundles-feature-searchField"
                                            chipGroupProps={{
                                                numChips: 1,
                                                expandedText: t("hide"),
                                                collapsedText: t("showRemaining")
                                            }}
                                            variant={SelectVariant.single}
                                            typeAheadAriaLabel="Select"
                                            onToggle={val => setSelectThemeTypeOpen(val)}
                                            selections={field.value}
                                            onSelect={selectedValue => {
                                                field.onChange(selectedValue.toString());
                                                setSelectThemeTypeOpen(false);
                                            }}
                                            onClear={() => {
                                                field.onChange("");
                                            }}
                                            isOpen={selectThemeTypeOpen}
                                            aria-label={t("selectThemeType")}
                                            chipGroupComponent={
                                                <div className="flex flex-wrap gap-1">
                                                    <Badge variant="secondary" className="cursor-pointer" key={field.value} onClick={(e) => { e.stopPropagation(); field.onChange(""); }}>
                                                        {field.value} <X className="size-3 ml-1 inline" />
                                                    </Badge>
                                                </div>
                                            }
                                        >
                                            {[
                                                <SelectOption
                                                    key="themeType_placeholder"
                                                    label={t("selectThemeType")}
                                                    isDisabled
                                                >
                                                    {t("selectThemeType")}
                                                </SelectOption>
                                            ].concat(
                                                themeTypes.map(option => (
                                                    <SelectOption
                                                        key={option}
                                                        value={option}
                                                    >
                                                        {option}
                                                    </SelectOption>
                                                ))
                                            )}
                                        </KeycloakSelect>
                                    )}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="kc-language">{t("language")} *</Label>
                                <Controller
                                    name="locale"
                                    control={control}
                                    defaultValue=""
                                    rules={{
                                        validate: value => (value || "").length > 0
                                    }}
                                    render={({ field }) => (
                                        <KeycloakSelect
                                            data-testid="effective-message-bundles-language-searchField"
                                            chipGroupProps={{
                                                numChips: 1,
                                                expandedText: t("hide"),
                                                collapsedText: t("showRemaining")
                                            }}
                                            variant={SelectVariant.single}
                                            typeAheadAriaLabel="Select"
                                            onToggle={val => setSelectLanguageOpen(val)}
                                            selections={field.value}
                                            onSelect={selectedValue => {
                                                field.onChange(selectedValue.toString());
                                                setSelectLanguageOpen(false);
                                            }}
                                            onClear={() => {
                                                field.onChange("");
                                            }}
                                            isOpen={selectLanguageOpen}
                                            aria-label={t("selectLanguage")}
                                            chipGroupComponent={
                                                <div className="flex flex-wrap gap-1">
                                                    {field.value ? (
                                                        <Badge variant="secondary" className="cursor-pointer" key={field.value} onClick={(e) => { e.stopPropagation(); field.onChange(""); }}>
                                                            {localeToDisplayName(field.value, whoAmI.locale)} <X className="size-3 ml-1 inline" />
                                                        </Badge>
                                                    ) : null}
                                                </div>
                                            }
                                        >
                                            {[
                                                <SelectOption
                                                    key="language_placeholder"
                                                    label={t("selectLanguage")}
                                                    isDisabled
                                                >
                                                    {t("selectLanguage")}
                                                </SelectOption>
                                            ].concat(
                                                combinedLocales.map(option => (
                                                    <SelectOption
                                                        key={option}
                                                        value={option}
                                                    >
                                                        {localeToDisplayName(
                                                            option,
                                                            whoAmI.locale
                                                        )}
                                                    </SelectOption>
                                                ))
                                            )}
                                        </KeycloakSelect>
                                    )}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="kc-hasWords">{t("hasWords")}</Label>
                                <Controller
                                    name="hasWords"
                                    control={control}
                                    render={({ field }) => (
                                        <div>
                                            <Input
                                                id="kc-hasWords"
                                                data-testid="effective-message-bundles-hasWords-searchField"
                                                value={field.value.join(" ")}
                                                onChange={e => {
                                                    const input = e.target.value;
                                                    if (input.trim().length === 0) {
                                                        field.onChange([]);
                                                    } else {
                                                        const words = input.split(" ").map(word => word.trim());
                                                        field.onChange(words);
                                                    }
                                                }}
                                            />
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {field.value.map(
                                                    (word: string, index: number) => (
                                                        <Badge variant="secondary" className="cursor-pointer" key={index} onClick={(e) => { e.stopPropagation(); field.onChange(field.value.filter((_: string, i: number) => i !== index)); }}>
                                                            {word} <X className="size-3 ml-1 inline" />
                                                        </Badge>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    )}
                                />
                            </div>
                            <div className="flex gap-2 mt-2">
                                <Button
                                    onClick={() => {
                                        setSearchPerformed(true);
                                        submitSearch();
                                    }}
                                    data-testid="search-effective-message-bundles-btn"
                                    disabled={!isValid}
                                >
                                    {t("search")}
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={resetSearch}
                                    data-testid="reset-search-effective-message-bundles-btn"
                                    disabled={!isDirty}
                                >
                                    {t("reset")}
                                </Button>
                            </div>
                        </form>
                    </DropdownPanel>
                </div>
                <div>
                    {Object.entries(activeFilters).length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                            {Object.entries(activeFilters).map(filter => {
                                const [key, value] = filter as [
                                    keyof EffectiveMessageBundlesSearchForm,
                                    string | string[]
                                ];
                                return (
                                    <div key={key} className="flex items-center gap-1">
                                        <span className="text-xs text-muted-foreground">{filterLabels[key]}:</span>
                                        {typeof value === "string" ? (
                                            <Badge variant="secondary">
                                                {key === "locale"
                                                    ? localeToDisplayName(value, whoAmI.locale)?.toLowerCase()
                                                    : value}
                                                <button className="ml-1" onClick={() => removeFilter(key)}><X className="size-3 inline" /></button>
                                            </Badge>
                                        ) : (
                                            value.map(entry => (
                                                <Badge variant="secondary" key={entry} className="cursor-pointer" onClick={() => removeFilterValue(key, entry)}>
                                                    {entry} <X className="size-3 ml-1 inline" />
                                                </Badge>
                                            ))
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    if (!searchPerformed) {
        return (
            <>
                <div className="py-4 pl-4">
                    {effectiveMessageBunldesSearchFormDisplay()}
                </div>
                <Separator />
                <ListEmptyState
                    message={t("emptyEffectiveMessageBundles")}
                    instructions={t("emptyEffectiveMessageBundlesInstructions")}
                    isSearchVariant
                />
            </>
        );
    }

    return (
        <KeycloakDataTable
            key={key}
            loader={loader}
            ariaLabelKey="effectiveMessageBundles"
            toolbarItem={effectiveMessageBunldesSearchFormDisplay()}
            columns={[
                {
                    name: "key",
                    displayKey: "key"
                },
                {
                    name: "value",
                    displayKey: "value"
                }
            ]}
            emptyState={
                <ListEmptyState
                    message={t("noSearchResults")}
                    instructions={t("noSearchResultsInstructions")}
                />
            }
            isSearching={Object.keys(activeFilters).length > 0}
        />
    );
};
