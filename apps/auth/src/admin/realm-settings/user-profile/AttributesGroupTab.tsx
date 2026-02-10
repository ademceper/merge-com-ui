import type { UserProfileGroup } from "@keycloak/keycloak-admin-client/lib/defs/userProfileMetadata";
import { Button } from "@merge/ui/components/button";
import {
    DataTable,
    DataTableRowActions,
    type ColumnDef,
} from "@merge/ui/components/table";
import { Trash } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
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
import { useRealm } from "../../context/realm-context/RealmContext";
import { useAdminClient } from "../../admin-client";
import useLocale from "../../utils/useLocale";
import { toEditAttributesGroup } from "../routes/EditAttributesGroup";
import { toNewAttributesGroup } from "../routes/NewAttributesGroup";
import { useUserProfile } from "./UserProfileContext";

type AttributesGroupTabProps = {
    setTableData: React.Dispatch<
        React.SetStateAction<Record<string, string>[] | undefined>
    >;
};

export const AttributesGroupTab = ({
    setTableData,
}: AttributesGroupTabProps) => {
    const { adminClient } = useAdminClient();
    const { config, save } = useUserProfile();
    const { t } = useTranslation();
    const combinedLocales = useLocale();
    const navigate = useNavigate();
    const { realm } = useRealm();
    const [key, setKey] = useState(0);
    const [groupToDelete, setGroupToDelete] = useState<UserProfileGroup>();

    useEffect(() => setKey((value) => value + 1), [config]);

    const data = config?.groups ?? [];

    const onDeleteConfirm = async () => {
        if (!config || !groupToDelete) return;
        const groups = (config.groups ?? []).filter(
            (group) => group !== groupToDelete,
        );
        const translationsForDisplayHeaderToDelete =
            groupToDelete.displayHeader?.substring(
                2,
                groupToDelete.displayHeader.length - 1,
            );
        const translationsForDisplayDescriptionToDelete =
            groupToDelete.displayDescription?.substring(
                2,
                groupToDelete.displayDescription.length - 1,
            );

        try {
            await Promise.all(
                combinedLocales.map(async (locale) => {
                    try {
                        await adminClient.realms.getRealmLocalizationTexts({
                            realm,
                            selectedLocale: locale,
                        });

                        if (translationsForDisplayHeaderToDelete) {
                            await adminClient.realms.deleteRealmLocalizationTexts(
                                {
                                    realm,
                                    selectedLocale: locale,
                                    key: translationsForDisplayHeaderToDelete,
                                },
                            );
                        }
                        if (translationsForDisplayDescriptionToDelete) {
                            await adminClient.realms.deleteRealmLocalizationTexts(
                                {
                                    realm,
                                    selectedLocale: locale,
                                    key: translationsForDisplayDescriptionToDelete,
                                },
                            );
                        }

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

            await save(
                { ...config!, groups },
                {
                    successMessageKey: "deleteSuccess",
                    errorMessageKey: "deleteAttributeGroupError",
                },
            );
            setGroupToDelete(undefined);
        } catch (error) {
            console.error(
                `Error removing translations or updating attributes group: ${error}`,
            );
        }
    };

    const columns: ColumnDef<UserProfileGroup>[] = [
        {
            accessorKey: "name",
            header: t("columnName"),
            cell: ({ row }) => (
                <Link
                    to={toEditAttributesGroup({
                        realm,
                        name: row.original.name!,
                    })}
                    className="text-primary hover:underline"
                >
                    {row.original.name}
                </Link>
            ),
        },
        {
            accessorKey: "displayHeader",
            header: t("columnDisplayName"),
            cell: ({ row }) => row.original.displayHeader ?? "-",
        },
        {
            accessorKey: "displayDescription",
            header: t("columnDisplayDescription"),
            cell: ({ row }) => row.original.displayDescription ?? "-",
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
                        onClick={() => setGroupToDelete(row.original)}
                    >
                        <Trash className="size-4 shrink-0" />
                        {t("delete")}
                    </button>
                </DataTableRowActions>
            ),
        },
    ];

    return (
        <>
            <AlertDialog open={!!groupToDelete} onOpenChange={(open) => !open && setGroupToDelete(undefined)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("deleteDialogTitle")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            <Trans i18nKey="deleteDialogDescription">
                                {" "}
                                <strong>{{ group: groupToDelete?.name }}</strong>.
                            </Trans>
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
            <div className="space-y-4">
                <DataTable
                    key={key}
                    columns={columns}
                    data={data}
                    searchColumnId="name"
                    searchPlaceholder={t("searchAttributes")}
                    emptyMessage={t("emptyStateMessage")}
                    toolbar={
                        <Button
                            data-testid="create-attributes-groups-action"
                            asChild
                            variant="default"
                            className="flex h-9 w-9 shrink-0 items-center justify-center p-0 sm:h-9 sm:w-auto sm:gap-2 sm:px-4 sm:py-2"
                        >
                            <Link to={toNewAttributesGroup({ realm })}>
                                {t("createGroupText")}
                            </Link>
                        </Button>
                    }
                />
            </div>
        </>
    );
};
