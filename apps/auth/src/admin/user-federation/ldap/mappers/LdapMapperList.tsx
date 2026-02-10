import type ComponentRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentRepresentation";
import { getErrorDescription, getErrorMessage, useFetch } from "../../../../shared/keycloak-ui-shared";
import { DataTable, DataTableRowActions, type ColumnDef } from "@merge/ui/components/table";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle
} from "@merge/ui/components/empty";
import { DropdownMenuItem } from "@merge/ui/components/dropdown-menu";
import { toast } from "@merge/ui/components/sonner";
import { Button } from "@merge/ui/components/button";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, To, useParams } from "react-router-dom";
import { useAdminClient } from "../../../admin-client";
import { useConfirmDialog } from "../../../components/confirm-dialog/ConfirmDialog";
import useLocaleSort, { mapByKey } from "../../../utils/useLocaleSort";

export type LdapMapperListProps = {
    toCreate: To;
    toDetail: (mapperId: string) => To;
};

type MapperLinkProps = ComponentRepresentation & {
    toDetail: (mapperId: string) => To;
};

const MapperLink = ({ toDetail, ...mapper }: MapperLinkProps) => (
    <Link to={toDetail(mapper.id!)}>{mapper.name}</Link>
);

export const LdapMapperList = ({ toCreate, toDetail }: LdapMapperListProps) => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
const [key, setKey] = useState(0);
    const refresh = () => setKey(key + 1);

    const [mappers, setMappers] = useState<ComponentRepresentation[]>([]);
    const localeSort = useLocaleSort();

    const { id } = useParams<{ id: string }>();

    const [selectedMapper, setSelectedMapper] = useState<ComponentRepresentation>();

    useFetch(
        () =>
            adminClient.components.find({
                parent: id,
                type: "org.keycloak.storage.ldap.mappers.LDAPStorageMapper"
            }),
        mapper => {
            setMappers(
                localeSort(
                    mapper.map(mapper => ({
                        ...mapper,
                        name: mapper.name,
                        type: mapper.providerId
                    })),
                    mapByKey("name")
                )
            );
        },
        [key]
    );

    const [toggleDeleteDialog, DeleteConfirm] = useConfirmDialog({
        titleKey: t("deleteMappingTitle", { mapperId: selectedMapper?.id }),
        messageKey: "deleteMappingConfirm",
        continueButtonLabel: "delete",
        continueButtonVariant: "destructive",
        onConfirm: async () => {
            try {
                await adminClient.components.del({
                    id: selectedMapper!.id!
                });
                refresh();
                toast.success(t("mappingDeletedSuccess"));
                setSelectedMapper(undefined);
            } catch (error) {
                toast.error(t("mappingDeletedError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
            }
        }
    });

    const columns: ColumnDef<ComponentRepresentation>[] = [
        { accessorKey: "name", header: t("name"), cell: ({ row }) => <MapperLink {...row.original} toDetail={toDetail} /> },
        { accessorKey: "type", header: t("type") },
        {
            id: "actions",
            cell: ({ row }) => (
                <DataTableRowActions row={row}>
                    <DropdownMenuItem onClick={() => { setSelectedMapper(row.original); toggleDeleteDialog(); }} className="text-destructive">
                        {t("delete")}
                    </DropdownMenuItem>
                </DataTableRowActions>
            )
        }
    ];

    const emptyContent = (
        <Empty className="py-12">
            <EmptyHeader><EmptyTitle>{t("emptyMappers")}</EmptyTitle></EmptyHeader>
            <EmptyContent><EmptyDescription>{t("emptyMappersInstructions")}</EmptyDescription></EmptyContent>
            <Button className="mt-2" asChild><Link to={toCreate}>{t("emptyPrimaryAction")}</Link></Button>
        </Empty>
    );

    return (
        <>
            <DeleteConfirm />
            <DataTable<ComponentRepresentation>
                key={key}
                columns={columns}
                data={mappers}
                searchColumnId="name"
                searchPlaceholder={t("searchForMapper")}
                emptyContent={emptyContent}
                emptyMessage={t("emptyMappers")}
                toolbar={
                    <Button data-testid="add-mapper-btn" asChild>
                        <Link to={toCreate}>{t("addMapper")}</Link>
                    </Button>
                }
            />
        </>
    );
};
