import type { UserProfileAttribute } from "@keycloak/keycloak-admin-client/lib/defs/userProfileMetadata";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@merge/ui/components/select";
import { Button } from "@merge/ui/components/button";
import {
    DataTable,
    DataTableRowActions,
    type ColumnDef,
} from "@merge/ui/components/table";
import { Funnel, PencilSimple, Plus, Trash } from "@phosphor-icons/react";
import { uniqBy } from "lodash-es";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useAdminClient } from "../../admin-client";
import { useConfirmDialog } from "../../components/confirm-dialog/ConfirmDialog";
import { KeycloakSpinner } from "../../../shared/keycloak-ui-shared";
import { useRealm } from "../../context/realm-context/RealmContext";
import useLocale from "../../utils/useLocale";
import { toAddAttribute } from "../routes/AddAttribute";
import { toAttribute } from "../routes/Attribute";
import { useUserProfile } from "./UserProfileContext";

const RESTRICTED_ATTRIBUTES = ["username", "email"];

type AttributesTabProps = {
    setTableData: React.Dispatch<
        React.SetStateAction<Record<string, string>[] | undefined>
    >;
};

export const AttributesTab = ({ setTableData }: AttributesTabProps) => {
    const { adminClient } = useAdminClient();
    const { config, save } = useUserProfile();
    const { realm } = useRealm();
    const { t } = useTranslation();
    const combinedLocales = useLocale();
    const navigate = useNavigate();
    const [filter, setFilter] = useState("allGroups");
    const [attributeToDelete, setAttributeToDelete] = useState("");

    const [toggleDeleteDialog, DeleteConfirm] = useConfirmDialog({
        titleKey: t("deleteAttributeConfirmTitle"),
        messageKey: t("deleteAttributeConfirm", {
            attributeName: attributeToDelete,
        }),
        continueButtonLabel: t("delete"),
        continueButtonVariant: "destructive",
        onConfirm: async () => {
            if (!config?.attributes) return;

            const translationsToDelete = config.attributes.find(
                (attribute) => attribute.name === attributeToDelete,
            )?.displayName;

            const formattedTranslationsToDelete = translationsToDelete?.substring(
                2,
                translationsToDelete.length - 1,
            );

            try {
                await Promise.all(
                    combinedLocales.map(async (locale) => {
                        try {
                            await adminClient.realms.getRealmLocalizationTexts({
                                realm,
                                selectedLocale: locale,
                            });

                            await adminClient.realms.deleteRealmLocalizationTexts({
                                realm,
                                selectedLocale: locale,
                                key: formattedTranslationsToDelete,
                            });

                            const updatedData =
                                await adminClient.realms.getRealmLocalizationTexts(
                                    {
                                        realm,
                                        selectedLocale: locale,
                                    },
                                );
                            setTableData([updatedData]);
                        } catch {
                            console.error(
                                `Error removing translations for ${locale}`,
                            );
                        }
                    }),
                );

                const updatedAttributes = config.attributes.filter(
                    (attribute) => attribute.name !== attributeToDelete,
                );
                const groups = config.groups ?? [];

                await save(
                    { ...config, attributes: updatedAttributes, groups },
                    {
                        successMessageKey: "deleteAttributeSuccess",
                        errorMessageKey: "deleteAttributeError",
                    },
                );

                setAttributeToDelete("");
            } catch (error) {
                console.error(
                    `Error removing translations or updating attributes: ${error}`,
                );
            }
        },
    });

    const attributes = config?.attributes ?? [];
    const groups = config?.groups ?? [];

    const filteredData = useMemo(() => {
        if (filter === "allGroups") return attributes;
        return attributes.filter((attr) => attr.group === filter);
    }, [attributes, filter]);

    const groupOptions = useMemo(
        () =>
            uniqBy(
                attributes.filter((attr) => !!attr.group),
                "group",
            ),
        [attributes],
    );

    const columns: ColumnDef<UserProfileAttribute>[] = useMemo(
        () => [
        {
            accessorKey: "name",
            header: t("attributeName"),
            cell: ({ row }) => (
                <Link
                    to={toAttribute({
                        realm: realm ?? "",
                        attributeName: row.original.name!,
                    })}
                    className="text-primary hover:underline"
                >
                    {row.original.name}
                </Link>
            ),
        },
        {
            accessorKey: "displayName",
            header: t("attributeDisplayName"),
            cell: ({ row }) => row.original.displayName ?? "-",
        },
        {
            accessorKey: "group",
            header: t("attributeGroup"),
            cell: ({ row }) => row.original.group ?? "-",
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
                        className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                        onClick={() =>
                            navigate(
                                toAttribute({
                                    realm: realm ?? "",
                                    attributeName: row.original.name!,
                                }),
                            )
                        }
                    >
                        <PencilSimple className="size-4 shrink-0" />
                        {t("edit")}
                    </button>
                    {!RESTRICTED_ATTRIBUTES.includes(row.original.name ?? "") && (
                        <>
                            <div className="my-1 h-px bg-border" />
                            <button
                                type="button"
                                className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-sm text-destructive hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => {
                                    setAttributeToDelete(row.original.name ?? "");
                                    toggleDeleteDialog();
                                }}
                            >
                                <Trash className="size-4 shrink-0" />
                                {t("delete")}
                            </button>
                        </>
                    )}
                </DataTableRowActions>
            ),
        },
    ],
        [t, navigate, realm, toggleDeleteDialog],
    );

    if (!config) {
        return <KeycloakSpinner />;
    }

    return (
        <>
            <DeleteConfirm />
            <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <Select
                        value={filter}
                        onValueChange={(value) => setFilter(value)}
                    >
                        <SelectTrigger
                            className="w-[200px]"
                            data-testid="filter-select"
                        >
                            <Funnel className="mr-2 size-4 shrink-0 opacity-60" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="allGroups" data-testid="all-groups">
                                {t("allGroups")}
                            </SelectItem>
                            {groupOptions.map(
                                (attr) =>
                                    attr.group && (
                                        <SelectItem
                                            key={attr.group}
                                            value={attr.group}
                                        >
                                            {attr.group}
                                        </SelectItem>
                                    ),
                            )}
                        </SelectContent>
                    </Select>
                    <Button
                        data-testid="createAttributeBtn"
                        asChild
                        variant="default"
                        className="flex h-9 w-9 shrink-0 items-center justify-center p-0 sm:h-9 sm:w-auto sm:gap-2 sm:px-4 sm:py-2"
                    >
                        <Link to={toAddAttribute({ realm: realm ?? "" })}>
                            <Plus size={20} className="shrink-0 sm:hidden" />
                            <span className="hidden sm:inline">
                                {t("createAttribute")}
                            </span>
                        </Link>
                    </Button>
                </div>
                <DataTable
                    columns={columns}
                    data={filteredData}
                    searchColumnId="name"
                    searchPlaceholder={t("searchAttributes")}
                    emptyMessage={t("noAttributes")}
                />
            </div>
        </>
    );
};
