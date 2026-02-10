import type RealmRepresentation from "@keycloak/keycloak-admin-client/lib/defs/realmRepresentation";
import { getErrorDescription, getErrorMessage } from "../../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@merge/ui/components/select";
import { Button } from "@merge/ui/components/button";
import { Input } from "@merge/ui/components/input";
import {
    DataTable,
    DataTableRowActions,
    type ColumnDef,
} from "@merge/ui/components/table";
import { Check, PencilSimple, Plus, Trash, X } from "@phosphor-icons/react";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../../admin-client";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@merge/ui/components/alert-dialog";
import { KeyValueType } from "../../components/key-value-form/key-value-convert";
import { useRealm } from "../../context/realm-context/RealmContext";
import { useWhoAmI } from "../../context/whoami/WhoAmI";
import { DEFAULT_LOCALE, i18n } from "../../i18n/i18n";
import { localeToDisplayName } from "../../util";
import { AddTranslationModal } from "../AddTranslationModal";
import { Separator } from "@merge/ui/components/separator";

type RealmOverridesProps = {
    internationalizationEnabled: boolean;
    watchSupportedLocales: string[];
    realm: RealmRepresentation;
    tableData: Record<string, string>[] | undefined;
};

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
    Delete = "delete",
}

const PAGE_SIZE = 500;

export const RealmOverrides = ({
    internationalizationEnabled,
    watchSupportedLocales,
    realm,
    tableData,
}: RealmOverridesProps) => {
    const { adminClient } = useAdminClient();
    const { t } = useTranslation();
    const { realm: currentRealm } = useRealm();
    const { whoAmI } = useWhoAmI();

    const [addTranslationModalOpen, setAddTranslationModalOpen] = useState(false);
    const [translations, setTranslations] = useState<[string, string][]>([]);
    const [selectMenuLocale, setSelectMenuLocale] = useState(DEFAULT_LOCALE);
    const [tableRows, setTableRows] = useState<TableRowData[]>([]);
    const [tableKey, setTableKey] = useState(0);
    const [editingKey, setEditingKey] = useState<string | null>(null);
    const [formValue, setFormValue] = useState("");
    const [keysToDelete, setKeysToDelete] = useState<string[]>([]);
    const translationForm = useForm<TranslationForm>({ mode: "onChange" });

    const refreshTable = useCallback(() => {
        setTableKey((k) => k + 1);
    }, []);

    useEffect(() => {
        let cancelled = false;
        const selectedLocale = selectMenuLocale || DEFAULT_LOCALE;

        const fetchLocalizationTexts = async () => {
            try {
                const result = await adminClient.realms.getRealmLocalizationTexts({
                    first: 0,
                    max: PAGE_SIZE,
                    realm: realm.realm!,
                    selectedLocale,
                });
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
    }, [tableKey, tableData, selectMenuLocale, realm.realm, adminClient]);

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
                .map((locale) => (
                    <SelectItem key={locale} value={locale}>
                        {localeToDisplayName(locale, whoAmI.locale)}
                    </SelectItem>
                ))}
        </SelectGroup>,
    ];

    const addKeyValue = async (pair: KeyValueType): Promise<void> => {
        try {
            await adminClient.realms.addLocalization(
                {
                    realm: currentRealm!,
                    selectedLocale: selectMenuLocale || DEFAULT_LOCALE,
                    key: pair.key,
                },
                pair.value,
            );
            adminClient.setConfig({ realmName: currentRealm! });
            refreshTable();
            translationForm.setValue("key", "");
            translationForm.setValue("value", "");
            await i18n.reloadResources();
            toast.success(t("addTranslationSuccess"));
        } catch (error) {
            toast.error(t("addTranslationError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error),
            });
        }
    };

    const onDeleteConfirm = async () => {
        try {
            for (const key of keysToDelete) {
                const data = i18n.store.data[whoAmI.locale][currentRealm] as Record<
                    string,
                    string
                > | undefined;
                if (data && key in data) delete data[key];
                await adminClient.realms.deleteRealmLocalizationTexts({
                    realm: currentRealm!,
                    selectedLocale: selectMenuLocale,
                    key,
                });
            }
            setKeysToDelete([]);
            refreshTable();
            toast.success(t("deleteAllTranslationsSuccess"));
        } catch (error) {
            toast.error(
                t("deleteAllTranslationsError", { error: getErrorMessage(error) }),
                { description: getErrorDescription(error) },
            );
        }
    };

    const handleSaveEdit = async (key: string, newValue: string) => {
        try {
            await adminClient.realms.addLocalization(
                {
                    realm: realm.realm!,
                    selectedLocale: selectMenuLocale || DEFAULT_LOCALE,
                    key,
                },
                newValue,
            );
            await i18n.reloadResources();
            toast.success(t("updateTranslationSuccess"));
            setTableRows((prev) =>
                prev.map((r) => (r.key === key ? { ...r, value: newValue } : r)),
            );
        } catch (error) {
            toast.error(t("updateTranslationError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error),
            });
        }
        setEditingKey(null);
    };

    const columns: ColumnDef<TableRowData>[] = [
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
            cell: ({ row }) => {
                const isEditing = editingKey === row.original.key;
                if (isEditing) {
                    return (
                        <form
                            className="kc-form-translationValue inline-flex items-center gap-1"
                            onSubmit={(e: FormEvent) => {
                                e.preventDefault();
                                void handleSaveEdit(row.original.key, formValue);
                            }}
                        >
                            <Input
                                aria-label={t("editTranslationValue")}
                                type="text"
                                className="w-auto min-w-[12rem]"
                                data-testid={`editTranslationValueInput-${row.original.key}`}
                                value={formValue}
                                onChange={(e: FormEvent<HTMLInputElement>) =>
                                    setFormValue(e.currentTarget.value)
                                }
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                data-testid={`editTranslationAcceptBtn-${row.original.key}`}
                                type="submit"
                                aria-label={t("acceptBtn")}
                            >
                                <Check className="size-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                data-testid={`editTranslationCancelBtn-${row.original.key}`}
                                aria-label={t("cancelBtn")}
                                type="button"
                                onClick={() => setEditingKey(null)}
                            >
                                <X className="size-4" />
                            </Button>
                        </form>
                    );
                }
                return (
                    <div className="inline-flex items-center gap-1">
                        <span>{row.original.value}</span>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={t("editBtn")}
                            data-testid={`editTranslationBtn-${row.original.key}`}
                            onClick={() => {
                                setFormValue(row.original.value);
                                setEditingKey(row.original.key);
                            }}
                        >
                            <PencilSimple className="size-4" />
                        </Button>
                    </div>
                );
            },
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
                        className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-sm text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setKeysToDelete([row.original.key])}
                    >
                        <Trash className="size-4 shrink-0" />
                        {t("delete")}
                    </button>
                </DataTableRowActions>
            ),
        },
    ];

    const currentLocaleLabel =
        selectMenuLocale && selectMenuLocale !== ""
            ? localeToDisplayName(selectMenuLocale, whoAmI.locale)
            : realm.defaultLocale !== ""
              ? localeToDisplayName(DEFAULT_LOCALE, whoAmI.locale)
              : t("placeholderText");

    return (
        <>
            <AlertDialog open={keysToDelete.length > 0} onOpenChange={(open) => !open && setKeysToDelete([])}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("deleteConfirmTranslationTitle")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("translationDeleteConfirmDialog", { count: keysToDelete.length })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                        <AlertDialogAction variant="destructive" data-testid="confirm" onClick={onDeleteConfirm}>
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
                        onValueChange={(v) => {
                            setSelectMenuLocale(v);
                            refreshTable();
                        }}
                        disabled={!internationalizationEnabled}
                    >
                        <SelectTrigger
                            className="w-[180px]"
                            data-testid="locale-select"
                        >
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
                <DataTable
                    key={tableKey}
                    columns={columns}
                    data={tableRows}
                    searchColumnId="key"
                    searchPlaceholder={t("searchForTranslation")}
                    emptyMessage={t("noTranslations")}
                />
            </div>
        </>
    );
};
