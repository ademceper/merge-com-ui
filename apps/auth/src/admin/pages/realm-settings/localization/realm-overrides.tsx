import type RealmRepresentation from "@keycloak/keycloak-admin-client/lib/defs/realmRepresentation";
import { DEFAULT_LOCALE, useTranslation } from "@merge-rd/i18n";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@merge-rd/ui/components/alert-dialog";
import { Button } from "@merge-rd/ui/components/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@merge-rd/ui/components/dropdown-menu";
import { FacetedFormFilter } from "@merge-rd/ui/components/faceted-filter/faceted-form-filter";
import { Input } from "@merge-rd/ui/components/input";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from "@merge-rd/ui/components/select";
import { Separator } from "@merge-rd/ui/components/separator";
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
import { Check, DotsThree, PencilSimple, Plus, Trash, X } from "@phosphor-icons/react";
import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
    getErrorDescription,
    getErrorMessage
} from "@/shared/keycloak-ui-shared";
import {
    addLocalization,
    deleteRealmLocalizationTexts,
    fetchRealmLocalizationTexts,
    setAdminClientRealmConfig
} from "@/admin/api/realm-settings";
import { i18n } from "@/admin/app/i18n";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import { useWhoAmI } from "@/admin/app/providers/whoami/who-am-i";
import { localeToDisplayName } from "@/admin/shared/lib/util";
import type { KeyValueType } from "@/admin/shared/ui/key-value-form/key-value-convert";
import { AddTranslationModal } from "../add-translation-modal";

type RealmOverridesProps = {
    internationalizationEnabled: boolean;
    watchSupportedLocales: string[];
    realm: RealmRepresentation;
    tableData: Record<string, string>[] | undefined;
};

type TableRowData = { key: string; value: string };

type TranslationForm = {
    key: string;
    value: string;
    translation: KeyValueType;
};

enum RowEditAction {
    Save = "save",
    Cancel = "cancel",
    Edit = "edit",
    Delete = "delete"
}

const PAGE_SIZE = 500;

export const RealmOverrides = ({
    internationalizationEnabled,
    watchSupportedLocales,
    realm,
    tableData
}: RealmOverridesProps) => {
    const { t } = useTranslation();
    const { realm: currentRealm } = useRealm();
    const { whoAmI } = useWhoAmI();

    const [addTranslationModalOpen, setAddTranslationModalOpen] = useState(false);
    const [_translations, setTranslations] = useState<[string, string][]>([]);
    const [selectMenuLocale, setSelectMenuLocale] = useState(DEFAULT_LOCALE);
    const [tableRows, setTableRows] = useState<TableRowData[]>([]);
    const [tableKey, setTableKey] = useState(0);
    const [editingKey, setEditingKey] = useState<string | null>(null);
    const [formValue, setFormValue] = useState("");
    const [keysToDelete, setKeysToDelete] = useState<string[]>([]);
    const translationForm = useForm<TranslationForm>({ mode: "onChange" });

    const [search, setSearch] = useState("");
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);

    useEffect(() => {
        setCurrentPage(0);
    }, [search, pageSize]);

    const filteredRows = useMemo(() => {
        if (!search) return tableRows;
        const lower = search.toLowerCase();
        return tableRows.filter(r => r.key.toLowerCase().includes(lower));
    }, [tableRows, search]);

    const totalCount = filteredRows.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const paginatedRows = useMemo(() => {
        const start = currentPage * pageSize;
        return filteredRows.slice(start, start + pageSize);
    }, [filteredRows, currentPage, pageSize]);

    const refreshTable = useCallback(() => {
        setTableKey(k => k + 1);
    }, []);

    useEffect(() => {
        let cancelled = false;
        const selectedLocale = selectMenuLocale || DEFAULT_LOCALE;

        const fetchLocalizationTexts = async () => {
            try {
                const result = await fetchRealmLocalizationTexts(
                    realm.realm!,
                    selectedLocale
                );
                if (cancelled) return;
                const entries = Object.entries(result);
                setTranslations(entries);
                setTableRows(entries.map(([key, value]) => ({ key, value })));
            } catch {
                if (!cancelled) setTableRows([]);
            }
        };

        void fetchLocalizationTexts();
        return () => {
            cancelled = true;
        };
    }, [tableKey, tableData, selectMenuLocale, realm.realm]);

    const localeOptions = [
        <SelectGroup key="group1">
            <SelectLabel>{t("defaultLocale")}</SelectLabel>
            <SelectItem key={String(DEFAULT_LOCALE)} value={DEFAULT_LOCALE}>
                {localeToDisplayName(DEFAULT_LOCALE, whoAmI.displayName)}
            </SelectItem>
        </SelectGroup>,
        <Separator key="divider" className="my-1" />,
        <SelectGroup key="group2">
            <SelectLabel>{t("supportedLocales")}</SelectLabel>
            {watchSupportedLocales
                .filter((locale): locale is string => Boolean(locale))
                .map(locale => (
                    <SelectItem key={locale} value={locale}>
                        {localeToDisplayName(locale, whoAmI.locale)}
                    </SelectItem>
                ))}
        </SelectGroup>
    ];

    const addKeyValue = async (pair: KeyValueType): Promise<void> => {
        try {
            await addLocalization(
                currentRealm!,
                selectMenuLocale || DEFAULT_LOCALE,
                pair.key,
                pair.value
            );
            setAdminClientRealmConfig(currentRealm!);
            refreshTable();
            translationForm.setValue("key", "");
            translationForm.setValue("value", "");
            await i18n.reloadResources();
            toast.success(t("addTranslationSuccess"));
        } catch (error) {
            toast.error(t("addTranslationError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        }
    };

    const onDeleteConfirm = async () => {
        try {
            for (const key of keysToDelete) {
                const data = i18n.store.data[whoAmI.locale][currentRealm] as
                    | Record<string, string>
                    | undefined;
                if (data && key in data) delete data[key];
                await deleteRealmLocalizationTexts(
                    currentRealm!,
                    selectMenuLocale,
                    key
                );
            }
            setKeysToDelete([]);
            refreshTable();
            toast.success(t("deleteAllTranslationsSuccess"));
        } catch (error) {
            toast.error(
                t("deleteAllTranslationsError", { error: getErrorMessage(error) }),
                { description: getErrorDescription(error) }
            );
        }
    };

    const handleSaveEdit = async (key: string, newValue: string) => {
        try {
            await addLocalization(
                realm.realm!,
                selectMenuLocale || DEFAULT_LOCALE,
                key,
                newValue
            );
            await i18n.reloadResources();
            toast.success(t("updateTranslationSuccess"));
            setTableRows(prev =>
                prev.map(r => (r.key === key ? { ...r, value: newValue } : r))
            );
        } catch (error) {
            toast.error(t("updateTranslationError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        }
        setEditingKey(null);
    };

    const currentLocaleLabel =
        selectMenuLocale && selectMenuLocale !== ""
            ? localeToDisplayName(selectMenuLocale, whoAmI.locale)
            : realm.defaultLocale !== ""
              ? localeToDisplayName(DEFAULT_LOCALE, whoAmI.locale)
              : t("placeholderText");

    return (
        <>
            <AlertDialog
                open={keysToDelete.length > 0}
                onOpenChange={open => !open && setKeysToDelete([])}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {t("deleteConfirmTranslationTitle")}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("translationDeleteConfirmDialog", {
                                count: keysToDelete.length
                            })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            data-testid="confirm"
                            onClick={onDeleteConfirm}
                        >
                            {t("delete")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            {addTranslationModalOpen && (
                <AddTranslationModal
                    handleModalToggle={() => setAddTranslationModalOpen(false)}
                    save={async (pair: TranslationForm) => {
                        await addKeyValue({ key: pair.key, value: pair.value });
                        setAddTranslationModalOpen(false);
                    }}
                    form={translationForm}
                />
            )}
            <p className="mb-4 text-sm text-muted-foreground">
                {t("realmOverridesDescription")}
            </p>
            <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <Select
                        value={selectMenuLocale || DEFAULT_LOCALE}
                        onValueChange={v => {
                            setSelectMenuLocale(v);
                            refreshTable();
                        }}
                        disabled={!internationalizationEnabled}
                    >
                        <SelectTrigger className="w-[180px]" data-testid="locale-select">
                            <SelectValue placeholder={t("placeholderText")}>
                                {currentLocaleLabel}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>{localeOptions}</SelectContent>
                    </Select>
                    <Button
                        data-testid="add-translationBtn"
                        variant="default"
                        className="flex h-9 w-9 shrink-0 items-center justify-center p-0 sm:h-9 sm:w-auto sm:gap-2 sm:px-4 sm:py-2"
                        aria-label={t("addTranslation")}
                        onClick={() => setAddTranslationModalOpen(true)}
                    >
                        <Plus size={20} className="shrink-0 sm:hidden" />
                        <span className="hidden sm:inline">{t("addTranslation")}</span>
                    </Button>
                </div>
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
                                <TableHead className="w-[35%]">{t("key")}</TableHead>
                                <TableHead className="w-[55%]">{t("value")}</TableHead>
                                <TableHead className="w-[10%]" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedRows.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={3}
                                        className="text-center text-muted-foreground"
                                    >
                                        {t("noTranslations")}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedRows.map(row => (
                                    <TableRow key={row.key}>
                                        <TableCell className="truncate">
                                            <span className="font-medium">{row.key}</span>
                                        </TableCell>
                                        <TableCell>
                                            {editingKey === row.key ? (
                                                <form
                                                    className="kc-form-translationValue inline-flex items-center gap-1"
                                                    onSubmit={(e: FormEvent) => {
                                                        e.preventDefault();
                                                        void handleSaveEdit(row.key, formValue);
                                                    }}
                                                >
                                                    <Input
                                                        aria-label={t("editTranslationValue")}
                                                        type="text"
                                                        className="w-auto min-w-[12rem]"
                                                        data-testid={`editTranslationValueInput-${row.key}`}
                                                        value={formValue}
                                                        onChange={(e: FormEvent<HTMLInputElement>) =>
                                                            setFormValue(e.currentTarget.value)
                                                        }
                                                    />
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        data-testid={`editTranslationAcceptBtn-${row.key}`}
                                                        type="submit"
                                                        aria-label={t("acceptBtn")}
                                                    >
                                                        <Check className="size-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        data-testid={`editTranslationCancelBtn-${row.key}`}
                                                        aria-label={t("cancelBtn")}
                                                        type="button"
                                                        onClick={() => setEditingKey(null)}
                                                    >
                                                        <X className="size-4" />
                                                    </Button>
                                                </form>
                                            ) : (
                                                <div className="inline-flex items-center gap-1">
                                                    <span>{row.value}</span>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        aria-label={t("editBtn")}
                                                        data-testid={`editTranslationBtn-${row.key}`}
                                                        onClick={() => {
                                                            setFormValue(row.value);
                                                            setEditingKey(row.key);
                                                        }}
                                                    >
                                                        <PencilSimple className="size-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell onClick={e => e.stopPropagation()}>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon-sm">
                                                        <DotsThree
                                                            weight="bold"
                                                            className="size-4"
                                                        />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive"
                                                        onClick={() => setKeysToDelete([row.key])}
                                                    >
                                                        <Trash className="size-4" />
                                                        {t("delete")}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell colSpan={3} className="p-0">
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
            </div>
        </>
    );
};
