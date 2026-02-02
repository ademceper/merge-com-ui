/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/realm-settings/localization/RealmOverrides.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import type RealmRepresentation from "@keycloak/keycloak-admin-client/lib/defs/realmRepresentation";
import {
    KeycloakSelect,
    ListEmptyState,
    PaginatingTableToolbar,
    SelectVariant,
    useAlerts
} from "../../../shared/keycloak-ui-shared";
import { AlertVariant } from "../../../shared/keycloak-ui-shared";
import {
    SelectGroup,
    SelectOption
} from "../../../shared/@patternfly/react-core";
import { Button } from "@merge/ui/components/button";
import { Separator } from "@merge/ui/components/separator";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@merge/ui/components/dropdown-menu";
import { Input } from "@merge/ui/components/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@merge/ui/components/table";
import { Check, PencilSimple, X, DotsThreeVertical, MagnifyingGlass } from "@phosphor-icons/react";
import { cloneDeep, isEqual, uniqWith } from "lodash-es";
import { ChangeEvent, useEffect, useState, type FormEvent } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../../admin-client";
import { useConfirmDialog } from "../../components/confirm-dialog/ConfirmDialog";
import { KeyValueType } from "../../components/key-value-form/key-value-convert";
import { useRealm } from "../../context/realm-context/RealmContext";
import { useWhoAmI } from "../../context/whoami/WhoAmI";
import { DEFAULT_LOCALE, i18n } from "../../i18n/i18n";
import { localeToDisplayName } from "../../util";
import { AddTranslationModal } from "../AddTranslationModal";

type RealmOverridesProps = {
    internationalizationEnabled: boolean;
    watchSupportedLocales: string[];
    realm: RealmRepresentation;
    tableData: Record<string, string>[] | undefined;
};

type EditStatesType = { [key: number]: boolean };

type TableRowData = { key: string; value: string };

export type TranslationForm = {
    key: string;
    value: string;
    translation: KeyValueType;
};

export enum RowEditAction {
    Save = "save",
    Cancel = "cancel",
    Edit = "edit",
    Delete = "delete"
}

export const RealmOverrides = ({
    internationalizationEnabled,
    watchSupportedLocales,
    realm,
    tableData
}: RealmOverridesProps) => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const [addTranslationModalOpen, setAddTranslationModalOpen] = useState(false);
    const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
    const [translations, setTranslations] = useState<[string, string][]>([]);
    const [selectMenuLocale, setSelectMenuLocale] = useState(DEFAULT_LOCALE);
    const [kebabOpen, setKebabOpen] = useState(false);
    const { getValues, handleSubmit } = useForm();
    const [selectMenuValueSelected, setSelectMenuValueSelected] = useState(false);
    const [tableRows, setTableRows] = useState<TableRowData[]>([]);
    const [tableKey, setTableKey] = useState(0);
    const [max, setMax] = useState(10);
    const [first, setFirst] = useState(0);
    const [filter, setFilter] = useState("");
    const translationForm = useForm<TranslationForm>({ mode: "onChange" });
    const { addAlert, addError } = useAlerts();
    const { realm: currentRealm } = useRealm();
    const { whoAmI } = useWhoAmI();
    const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
    const [areAllRowsSelected, setAreAllRowsSelected] = useState(false);
    const [editStates, setEditStates] = useState<EditStatesType>({});
    const [formValue, setFormValue] = useState("");
    const refreshTable = () => {
        setTableKey(tableKey + 1);
    };

    useEffect(() => {
        const fetchLocalizationTexts = async () => {
            try {
                let result = await adminClient.realms.getRealmLocalizationTexts({
                    first,
                    max,
                    realm: realm.realm!,
                    selectedLocale:
                        selectMenuLocale || getValues("defaultLocale") || whoAmI.locale
                });

                setTranslations(Object.entries(result));

                if (filter) {
                    const searchInTranslations = (idx: number) => {
                        return Object.entries(result).filter(i =>
                            i[idx].includes(filter)
                        );
                    };

                    const filtered = uniqWith(
                        searchInTranslations(0).concat(searchInTranslations(1)),
                        isEqual
                    );

                    result = Object.fromEntries(filtered);
                }

                return Object.entries(result).slice(first, first + max);
            } catch {
                return [];
            }
        };

        void fetchLocalizationTexts().then(translations => {
            const updatedRows: TableRowData[] = translations.map(([key, value]) => ({
                key,
                value
            }));

            setTableRows(updatedRows);
        });
    }, [tableKey, tableData, first, max, filter]);

    const handleModalToggle = () => {
        setAddTranslationModalOpen(!addTranslationModalOpen);
    };

    const options = [
        <SelectGroup label={t("defaultLocale")} key="group1">
            <SelectOption key={String(DEFAULT_LOCALE)} value={DEFAULT_LOCALE}>
                {localeToDisplayName(DEFAULT_LOCALE, whoAmI.displayName)}
            </SelectOption>
        </SelectGroup>,
        <Separator key="divider" className="my-1" />,
        <SelectGroup label={t("supportedLocales")} key="group2">
            {watchSupportedLocales.map(locale => (
                <SelectOption key={locale} value={locale}>
                    {localeToDisplayName(locale, whoAmI.locale)}
                </SelectOption>
            ))}
        </SelectGroup>
    ];

    const addKeyValue = async (pair: KeyValueType): Promise<void> => {
        try {
            await adminClient.realms.addLocalization(
                {
                    realm: currentRealm!,
                    selectedLocale:
                        selectMenuLocale || getValues("defaultLocale") || DEFAULT_LOCALE,
                    key: pair.key
                },
                pair.value
            );

            adminClient.setConfig({
                realmName: currentRealm!
            });
            refreshTable();
            translationForm.setValue("key", "");
            translationForm.setValue("value", "");
            await i18n.reloadResources();

            addAlert(t("addTranslationSuccess"), AlertVariant.success);
        } catch (error) {
            addError("addTranslationError", error);
        }
    };

    const [toggleDeleteDialog, DeleteConfirm] = useConfirmDialog({
        titleKey: "deleteConfirmTranslationTitle",
        messageKey: t("translationDeleteConfirmDialog", {
            count: selectedRowKeys.length
        }),
        continueButtonLabel: "delete",
        continueButtonVariant: "destructive",
        onCancel: () => {
            setSelectedRowKeys([]);
            setAreAllRowsSelected(false);
        },
        onConfirm: async () => {
            try {
                for (const key of selectedRowKeys) {
                    delete (
                        i18n.store.data[whoAmI.locale][currentRealm] as Record<
                            string,
                            string
                        >
                    )[key];
                    await adminClient.realms.deleteRealmLocalizationTexts({
                        realm: currentRealm!,
                        selectedLocale: selectMenuLocale,
                        key: key
                    });
                }
                setAreAllRowsSelected(false);
                setSelectedRowKeys([]);
                refreshTable();

                addAlert(t("deleteAllTranslationsSuccess"), AlertVariant.success);
            } catch (error) {
                addError("deleteAllTranslationsError", error);
            }
        }
    });

    const handleRowSelect = (event: ChangeEvent<HTMLInputElement>, rowIndex: number) => {
        const selectedKey = tableRows[rowIndex].key;
        if (event.target.checked) {
            setSelectedRowKeys(prevSelected => [...prevSelected, selectedKey]);
        } else {
            setSelectedRowKeys(prevSelected =>
                prevSelected.filter(key => key !== selectedKey)
            );
        }

        setAreAllRowsSelected(
            tableRows.length === selectedRowKeys.length + (event.target.checked ? 1 : -1)
        );
    };

    const toggleSelectAllRows = () => {
        if (areAllRowsSelected) {
            setSelectedRowKeys([]);
        } else {
            setSelectedRowKeys(tableRows.map(row => row.key));
        }
        setAreAllRowsSelected(!areAllRowsSelected);
    };

    const isRowSelected = (key: any) => {
        return selectedRowKeys.includes(key);
    };

    const onSubmit = async (inputValue: string, rowIndex: number) => {
        const newRows = cloneDeep(tableRows);
        newRows[rowIndex] = { ...newRows[rowIndex], value: inputValue };

        try {
            const { key, value } = newRows[rowIndex];

            await adminClient.realms.addLocalization(
                {
                    realm: realm.realm!,
                    selectedLocale:
                        selectMenuLocale || getValues("defaultLocale") || DEFAULT_LOCALE,
                    key
                },
                value
            );
            await i18n.reloadResources();

            addAlert(t("updateTranslationSuccess"), AlertVariant.success);
            setTableRows(newRows);
        } catch (error) {
            addError("updateTranslationError", error);
        }

        setEditStates(prevEditStates => ({
            ...prevEditStates,
            [rowIndex]: false
        }));
    };

    return (
        <>
            <DeleteConfirm />
            {addTranslationModalOpen && (
                <AddTranslationModal
                    handleModalToggle={handleModalToggle}
                    save={async (pair: any) => {
                        await addKeyValue(pair);
                        handleModalToggle();
                    }}
                    form={translationForm}
                />
            )}
            <p className="mt-4 ml-4 text-sm text-muted-foreground">
                {t("realmOverridesDescription")}
            </p>
            <PaginatingTableToolbar
                count={translations.length}
                first={first}
                max={max}
                onNextClick={setFirst}
                onPreviousClick={setFirst}
                onPerPageSelect={(first, max) => {
                    setFirst(first);
                    setMax(max);
                }}
                inputGroupName={"search"}
                inputGroupOnEnter={search => {
                    setFilter(search);
                    setFirst(0);
                    setMax(10);
                }}
                inputGroupPlaceholder={t("searchForTranslation")}
                toolbarItem={
                    <>
                        <Button
                            data-testid="add-translationBtn"
                            onClick={() => {
                                setAddTranslationModalOpen(true);
                                setAreAllRowsSelected(false);
                                setSelectedRowKeys([]);
                            }}
                        >
                            {t("addTranslation")}
                        </Button>
                        <DropdownMenu
                            open={kebabOpen}
                            onOpenChange={setKebabOpen}
                        >
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    data-testid="toolbar-deleteBtn"
                                    aria-label="kebab"
                                >
                                    <DotsThreeVertical className="size-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                    data-testid="delete-selected-TranslationBtn"
                                    disabled={
                                        translations.length === 0 ||
                                        selectedRowKeys.length === 0
                                    }
                                    onClick={() => {
                                        toggleDeleteDialog();
                                        setKebabOpen(false);
                                    }}
                                >
                                    {t("delete")}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </>
                }
                searchTypeComponent={
                    <KeycloakSelect
                            width={180}
                            isOpen={filterDropdownOpen}
                            className="kc-filter-by-locale-select"
                            variant={SelectVariant.single}
                            isDisabled={!internationalizationEnabled}
                            onToggle={isExpanded => setFilterDropdownOpen(isExpanded)}
                            onSelect={value => {
                                setSelectMenuLocale(value.toString());
                                setSelectMenuValueSelected(true);
                                refreshTable();
                                setFilterDropdownOpen(false);
                            }}
                            selections={
                                selectMenuValueSelected
                                    ? localeToDisplayName(selectMenuLocale, whoAmI.locale)
                                    : realm.defaultLocale !== ""
                                      ? localeToDisplayName(DEFAULT_LOCALE, whoAmI.locale)
                                      : t("placeholderText")
                            }
                        >
                            {options}
                        </KeycloakSelect>
                }
            >
                {translations.length === 0 && !filter && (
                    <ListEmptyState
                        hasIcon
                        message={t("noTranslations")}
                        instructions={t("noTranslationsInstructions")}
                        onPrimaryAction={handleModalToggle}
                    />
                )}
                {translations.length === 0 && filter && (
                    <ListEmptyState
                        hasIcon
                        icon={MagnifyingGlass}
                        isSearchVariant
                        message={t("noSearchResults")}
                        instructions={t("noRealmOverridesSearchResultsInstructions")}
                    />
                )}
                {translations.length !== 0 && (
                    <Table
                        aria-label={t("editableRowsTable")}
                        data-testid="editable-rows-table"
                        className="text-sm"
                    >
                        <TableHeader>
                            <TableRow>
                                <TableHead className="px-4">
                                    <input
                                        type="checkbox"
                                        aria-label={t("selectAll")}
                                        checked={areAllRowsSelected}
                                        onChange={toggleSelectAllRows}
                                        data-testid="selectAll"
                                    />
                                </TableHead>
                                <TableHead className="py-4">{t("key")}</TableHead>
                                <TableHead className="py-4">{t("value")}</TableHead>
                                <TableHead aria-hidden="true" className="w-12" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tableRows.map((row, rowIndex) => (
                                <TableRow key={row.key}>
                                    <TableCell className="px-4">
                                        <input
                                            type="checkbox"
                                            aria-label={row.key}
                                            checked={isRowSelected(row.key)}
                                            onChange={e =>
                                                handleRowSelect(
                                                    e as ChangeEvent<HTMLInputElement>,
                                                    rowIndex
                                                )}
                                        />
                                    </TableCell>
                                    <TableCell className="px-2">{row.key}</TableCell>
                                    <TableCell className="px-2" key={rowIndex}>
                                        <form
                                            className="kc-form-translationValue inline-flex items-center gap-1"
                                            onSubmit={handleSubmit(async () => {
                                                await onSubmit(formValue, rowIndex);
                                            })}
                                        >
                                            {editStates[rowIndex] ? (
                                                <>
                                                    <Input
                                                        aria-label={t("editTranslationValue")}
                                                        type="text"
                                                        className="w-auto min-w-[12rem]"
                                                        data-testid={`editTranslationValueInput-${rowIndex}`}
                                                        value={formValue}
                                                        onChange={(
                                                            e: FormEvent<HTMLInputElement>
                                                        ) => setFormValue(e.currentTarget.value)}
                                                        key={`edit-input-${rowIndex}`}
                                                    />
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        data-testid={`editTranslationAcceptBtn-${rowIndex}`}
                                                        type="submit"
                                                        aria-label={t("acceptBtn")}
                                                    >
                                                        <Check className="size-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        data-testid={`editTranslationCancelBtn-${rowIndex}`}
                                                        aria-label={t("cancelBtn")}
                                                        type="button"
                                                        onClick={() => {
                                                            setEditStates(prev => ({
                                                                ...prev,
                                                                [rowIndex]: false
                                                            }));
                                                        }}
                                                    >
                                                        <X className="size-4" />
                                                    </Button>
                                                </>
                                            ) : (
                                                <>
                                                    <span>{row.value}</span>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        aria-label={t("editBtn")}
                                                        data-testid={`editTranslationBtn-${rowIndex}`}
                                                        onClick={() => {
                                                            setFormValue(tableRows[rowIndex].value);
                                                            setEditStates(prev => ({
                                                                ...prev,
                                                                [rowIndex]: true
                                                            }));
                                                        }}
                                                    >
                                                        <PencilSimple className="size-4" />
                                                    </Button>
                                                </>
                                            )}
                                        </form>
                                    </TableCell>
                                    <TableCell className="w-12">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    aria-label={t("delete")}
                                                >
                                                    <DotsThreeVertical className="size-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        setSelectedRowKeys([row.key]);
                                                        if (translations.length === 1) {
                                                            setAreAllRowsSelected(true);
                                                        }
                                                        toggleDeleteDialog();
                                                    }}
                                                >
                                                    {t("delete")}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </PaginatingTableToolbar>
        </>
    );
};
